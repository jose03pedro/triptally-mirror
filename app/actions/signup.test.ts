process.env.JWT_SECRET = "test_secret_key";

import { signup } from "../actions/signup";
import User from "../models/User";
import { hash } from "bcrypt";

jest.mock("bcrypt");

jest.mock("@/lib/mongoose", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve()),
}));

jest.mock("../models/User", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe("signup action", () => {
  const mockFormData = (data: Record<string, string>) =>
    ({
      get: (key: string) => data[key],
    } as unknown as FormData);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns error if email already exists", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      email: "test@example.com",
    });

    const res = await signup(
      {} as any,
      mockFormData({ email: "test@example.com" })
    );

    expect(res.success).toBe(false);
    expect(res.errors?.email).toContain("This email is already registered.");
  });

  test("creates a new user with valid data", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (hash as jest.Mock).mockResolvedValue("hashed-password");
    (User.create as jest.Mock).mockResolvedValue({ _id: "123" });

    const res = await signup(
      {} as any,
      mockFormData({
        email: "new@example.com",
        password: "Password123!",
        first_name: "John",
        last_name: "Doe",
      })
    );

    expect(User.create).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "hashed-password",
      first_name: "John",
      last_name: "Doe",
    });
    expect(res.success).toBe(true);
  });

  test("returns validation errors for missing fields", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const res = await signup({} as any, mockFormData({ email: "" }));

    expect(res.success).toBe(false);
    expect(res.errors?.email).toHaveLength(1);
    expect(res.errors?.password).toHaveLength(1);
    expect(res.errors?.first_name).toHaveLength(1);
    expect(res.errors?.last_name).toHaveLength(1);
  });
});
