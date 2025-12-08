import { getCurrentUser } from "@/lib/auth/getCurrentUser";

// mock completo do next/headers para controlarmos cookies
jest.mock("next/headers", () => {
  let store = new Map<string, string>();

  return {
    cookies: jest.fn(() => ({
      get: (name: string) => {
        const value = store.get(name);
        return value ? { name, value } : undefined;
      },
      set: (name: string, value: string) => {
        store.set(name, value);
      },
      delete: (name: string) => {
        store.delete(name);
      },
    })),
    // helper para os testes mexerem no store
    __setCookie: (name: string, value: string) => {
      store.set(name, value);
    },
    __clearCookies: () => {
      store.clear();
    },
  };
});

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("@/app/models/User", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

const headersMock = jest.requireMock("next/headers");
const jwtMock = jest.requireMock("jsonwebtoken");
const UserMock = jest.requireMock("@/app/models/User").default;

describe("getCurrentUser", () => {
  // Suppress console.error for tests that are expected to fail
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    headersMock.__clearCookies();
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
  });

  it("retorna null se não existir cookie 'session'", async () => {
    const user = await getCurrentUser();
    expect(user).toBeNull();
    expect(jwtMock.verify).not.toHaveBeenCalled();
  });

  it("retorna null se o token for inválido / lançar erro", async () => {
    headersMock.__setCookie("session", "invalid_token");
    (jwtMock.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid token");
    });

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("retorna null se o decoded for string", async () => {
    headersMock.__setCookie("session", "some_token");
    (jwtMock.verify as jest.Mock).mockReturnValue("string-decoded");

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("retorna null se o utilizador não existir na BD", async () => {
    headersMock.__setCookie("session", "some_token");
    (jwtMock.verify as jest.Mock).mockReturnValue({
      user: { id: "123" },
    });

    (UserMock.findById as jest.Mock).mockResolvedValue(null);

    const user = await getCurrentUser();
    expect(UserMock.findById).toHaveBeenCalledWith("123");
    expect(user).toBeNull();
  });

  it("retorna o objeto { id } quando tudo corre bem", async () => {
    headersMock.__setCookie("session", "some_token");
    (jwtMock.verify as jest.Mock).mockReturnValue({
      user: { id: "123" },
    });

    (UserMock.findById as jest.Mock).mockResolvedValue({
      _id: { toString: () => "123" },
    });

    const user = await getCurrentUser();
    expect(jwtMock.verify).toHaveBeenCalledWith("some_token", "test_secret");
    expect(UserMock.findById).toHaveBeenCalledWith("123");
    expect(user).toEqual({ id: "123" });
  });
});
