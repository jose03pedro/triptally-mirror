import { renderHook } from "@testing-library/react";
import { useAuth } from "./useAuth";

// Mock jwt-decode
jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));

import { jwtDecode } from "jwt-decode";

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("returns null if no token is present", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toBeNull();
  });

  it("decodes a valid token (24h) and returns user", () => {
    const fakeToken = "fake.jwt.token";
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const decoded = {
      email: "test@example.com",
      iat: nowInSeconds,
      exp: nowInSeconds + 24 * 60 * 60, // 24 hours from now
    };

    localStorage.setItem("token", fakeToken);
    (jwtDecode as jest.Mock).mockReturnValue(decoded);

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual(decoded);
  });

  it("returns null and removes expired token (older than 24h)", () => {
    const fakeToken = "expired.jwt.token";
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expired = {
      email: "test@example.com",
      iat: nowInSeconds - 25 * 60 * 60, // issued 25h ago
      exp: nowInSeconds - 1, // expired 1 second ago
    };

    localStorage.setItem("token", fakeToken);
    (jwtDecode as jest.Mock).mockReturnValue(expired);

    const { result } = renderHook(() => useAuth());

    expect(result.current).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("returns null and removes invalid token", () => {
    localStorage.setItem("token", "invalid.token");
    (jwtDecode as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
