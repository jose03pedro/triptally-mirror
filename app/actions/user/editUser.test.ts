process.env.JWT_SECRET = "test_secret_key";

import { editUser } from "./editUser";
import User from "../../models/User";
import { compare, hash } from "bcrypt";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { logoutHandler } from "../auth/logout";

jest.mock("@/lib/mongoose", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../models/User", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("@/lib/auth/getCurrentUser", () => ({
  __esModule: true,
  getCurrentUser: jest.fn(),
}));

jest.mock("../auth/logout", () => ({
  __esModule: true,
  logoutHandler: jest.fn(),
}));

// Single mock for both schemas
jest.mock("@/lib/definitions", () => ({
  __esModule: true,
  EditUserSchema: {
    safeParse: (data: any) => {
      const fe: Record<string, string[]> = {};
      if (!data.first_name) fe.first_name = ["Required"];
      if (!data.last_name) fe.last_name = ["Required"];
      if (!data.current_password) fe.current_password = ["Required"];
      if (Object.keys(fe).length) {
        return {
          success: false,
          error: { flatten: () => ({ fieldErrors: fe }) },
        };
      }
      return { success: true, data };
    },
  },
  ChangePasswordSchema: {
    safeParse: (data: any) => {
      const fe: Record<string, string[]> = {};
      if (!data.password || data.password.length < 8) {
        fe.password = ["Password must be at least 8 characters"];
        return {
          success: false,
          error: { flatten: () => ({ fieldErrors: fe }) },
        };
      }
      return { success: true, data };
    },
  },
}));

const mockFormData = (data: Record<string, string>) =>
({
  get: (k: string) => data[k],
} as unknown as FormData);

describe("editUser action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("unauthenticated user", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    const res = await editUser({}, mockFormData({}));
    expect(res.success).toBe(false);
    expect(res.errors.message).toBe("User not authenticated");
  });

  test("validation errors", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "u1" });
    const res = await editUser(
      {},
      mockFormData({ first_name: "", last_name: "", current_password: "" })
    );
    expect(res.success).toBe(false);
    expect(res.errors.first_name).toContain("Required");
    expect(res.errors.last_name).toContain("Required");
    expect(res.errors.current_password).toContain("Required");
  });

  test("missing current password", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "u1" });
    const res = await editUser(
      {},
      mockFormData({ first_name: "A", last_name: "B", current_password: "" })
    );
    expect(res.success).toBe(false);
    expect(res.errors.current_password).toContain("Required");
  });

  test("user not found", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "u1" });
    (User.findById as jest.Mock).mockResolvedValue(null);
    const res = await editUser(
      {},
      mockFormData({ first_name: "A", last_name: "B", current_password: "x" })
    );
    expect(res.success).toBe(false);
    expect(res.errors.first_name).toContain("User not found");
  });

  test("incorrect current password", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "u1" });
    (User.findById as jest.Mock).mockResolvedValue({ password: "hashed" });
    (compare as jest.Mock).mockResolvedValue(false);
    const res = await editUser(
      {},
      mockFormData({ first_name: "A", last_name: "B", current_password: "bad" })
    );
    expect(res.success).toBe(false);
    expect(res.errors.current_password).toContain(
      "Current password is incorrect"
    );
  });

  test("update names only success", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "u1" });

    // First call returns password for verification
    const mockLeanResult = {
      _id: "u1",
      email: "e@x",
      first_name: "A",
      last_name: "B",
    };

    (User.findById as jest.Mock)
      .mockResolvedValueOnce({ password: "hashed" })
      .mockResolvedValueOnce({
        lean: jest.fn().mockResolvedValue(mockLeanResult),
      });

    (compare as jest.Mock).mockResolvedValue(true);

    const res = await editUser(
      {},
      mockFormData({ first_name: "A", last_name: "B", current_password: "ok" })
    );

    expect(res.success).toBe(true);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith("u1", {
      first_name: "A",
      last_name: "B",
    });
    expect(logoutHandler).toHaveBeenCalled();
  });

  test("password validation fails", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "u1" });
    (User.findById as jest.Mock).mockResolvedValue({ password: "hashed" });
    (compare as jest.Mock).mockResolvedValue(true);
    const res = await editUser(
      {},
      mockFormData({
        first_name: "A",
        last_name: "B",
        current_password: "ok",
        password: "short",
      })
    );
    expect(res.success).toBe(false);
    expect(res.errors.password).toContain(
      "Password must be at least 8 characters"
    );
  });

  test("update with new password success", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "u1" });

    (User.findById as jest.Mock)
      .mockResolvedValueOnce({ password: "hashed" })
      .mockReturnValueOnce({
        lean: () => ({
          _id: "u1",
          email: "e@x",
          first_name: "A",
          last_name: "B",
        }),
      });

    (compare as jest.Mock).mockResolvedValue(true);
    (hash as jest.Mock).mockResolvedValue("newhash");

    const res = await editUser(
      {},
      mockFormData({
        first_name: "A",
        last_name: "B",
        current_password: "ok",
        password: "StrongPass1!",
      })
    );

    expect(res.success).toBe(true);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith("u1", {
      first_name: "A",
      last_name: "B",
      password: "newhash",
    });
    expect(logoutHandler).toHaveBeenCalled();
  });
});
