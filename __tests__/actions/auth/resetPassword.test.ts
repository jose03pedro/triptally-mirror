// Mock the dependencies BEFORE importing the modules that use them
jest.mock("@/lib/mongoose", () => jest.fn().mockResolvedValue(undefined));
jest.mock("bcrypt");

// Mock the User model
jest.mock("@/app/models/User", () => ({
  __esModule: true,
  default: {
    findByIdAndUpdate: jest.fn(),
  },
}));

// Mock the PasswordReset model
jest.mock("@/app/models/PasswordReset", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

// Import AFTER mocking
import { resetPassword } from "@/app/actions/auth/resetPassword";
import User from "@/app/models/User";
import PasswordReset from "@/app/models/PasswordReset";
import { hash } from "bcrypt";
import crypto from "crypto";

// Access the mocked functions
const mockFindByIdAndUpdate = User.findByIdAndUpdate as jest.Mock;
const mockFindOne = PasswordReset.findOne as jest.Mock;
const mockDeleteOne = PasswordReset.deleteOne as jest.Mock;

describe("resetPassword", () => {
  // Suppress console errors in tests
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error if token is missing", async () => {
    const formData = new FormData();
    formData.append("password", "NewPass123!");
    formData.append("confirmPassword", "NewPass123!");

    const result = await resetPassword(formData);

    expect(result.success).toBe(false);
    expect(result.errors?.token).toContain("Token is required");
  });

  it("should return error if passwords do not match", async () => {
    const formData = new FormData();
    formData.append("token", "valid-token");
    formData.append("password", "NewPass123!");
    formData.append("confirmPassword", "DifferentPass456!");

    const result = await resetPassword(formData);

    expect(result.success).toBe(false);
    expect(result.errors?.password).toContain("Passwords must match");
  });

  it("should return error if password is too weak", async () => {
    const formData = new FormData();
    formData.append("token", "valid-token");
    formData.append("password", "weak");
    formData.append("confirmPassword", "weak");

    const result = await resetPassword(formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid password");
    expect(result.errors?.password).toBeDefined();
  });

  it("should return error if token is expired or invalid", async () => {
    mockFindOne.mockResolvedValue(null);

    const formData = new FormData();
    formData.append("token", "expired-token");
    formData.append("password", "NewPass123!");
    formData.append("confirmPassword", "NewPass123!");

    const result = await resetPassword(formData);

    expect(result.success).toBe(false);
    expect(result.errors?.token).toContain("This reset link has expired or is invalid");
  });

  it("should reset password successfully with valid token", async () => {
    const mockToken = "valid-token-12345";
    const hashedToken = crypto.createHash("sha256").update(mockToken).digest("hex");

    mockFindOne.mockResolvedValue({
      _id: "reset123",
      userId: "user123",
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000),
    });
    (hash as jest.Mock).mockResolvedValue("hashed-new-password");
    mockFindByIdAndUpdate.mockResolvedValue({
      _id: "user123",
      email: "test@example.com",
    });
    mockDeleteOne.mockResolvedValue({ deletedCount: 1 });

    const formData = new FormData();
    formData.append("token", mockToken);
    formData.append("password", "NewPass123!");
    formData.append("confirmPassword", "NewPass123!");

    const result = await resetPassword(formData);

    expect(result.success).toBe(true);
    expect(result.message).toContain("Password reset successfully");

    // Verify password was hashed
    expect(hash).toHaveBeenCalledWith("NewPass123!", 10);

    // Verify user was updated
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith("user123", {
      password: "hashed-new-password",
    });

    // Verify token was deleted
    expect(mockDeleteOne).toHaveBeenCalledWith({ _id: "reset123" });
  });

  it("should hash token before database lookup", async () => {
    const plainToken = "plain-token-123";
    const expectedHash = crypto.createHash("sha256").update(plainToken).digest("hex");

    mockFindOne.mockResolvedValue(null);

    const formData = new FormData();
    formData.append("token", plainToken);
    formData.append("password", "NewPass123!");
    formData.append("confirmPassword", "NewPass123!");

    await resetPassword(formData);

    expect(mockFindOne).toHaveBeenCalledWith({
      token: expectedHash,
      expiresAt: { $gt: expect.any(Date) },
    });
  });

  it("should check token expiration", async () => {
    const beforeCall = Date.now();

    mockFindOne.mockResolvedValue(null);

    const formData = new FormData();
    formData.append("token", "some-token");
    formData.append("password", "NewPass123!");
    formData.append("confirmPassword", "NewPass123!");

    await resetPassword(formData);

    const callArgs = mockFindOne.mock.calls[0][0];
    const expiryCheck = callArgs.expiresAt.$gt.getTime();

    // Should check for tokens expiring after current time
    expect(expiryCheck).toBeGreaterThanOrEqual(beforeCall);
    expect(expiryCheck).toBeLessThanOrEqual(Date.now());
  });

  it("should handle database errors gracefully", async () => {
    mockFindOne.mockRejectedValue(new Error("Database connection failed"));

    const formData = new FormData();
    formData.append("token", "valid-token");
    formData.append("password", "NewPass123!");
    formData.append("confirmPassword", "NewPass123!");

    const result = await resetPassword(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("An error occurred");

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
        "Reset password error:",
        expect.any(Error)
    );
  });
});