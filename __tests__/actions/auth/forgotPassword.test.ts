// Mock the dependencies BEFORE importing the modules that use them
jest.mock("@/lib/mongoose", () => jest.fn().mockResolvedValue(undefined));
jest.mock("@/app/actions/mail/sendEmail");

// Mock the User model - use a factory function
jest.mock("@/app/models/User", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

// Mock the PasswordReset model - use a factory function
jest.mock("@/app/models/PasswordReset", () => ({
  __esModule: true,
  default: {
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
}));

// Import AFTER mocking
import { forgotPassword } from "@/app/actions/auth/forgotPassword";
import { sendEmail } from "@/app/actions/mail/sendEmail";
import User from "@/app/models/User";
import PasswordReset from "@/app/models/PasswordReset";

// Now you can access the mocked functions
const mockFindOne = User.findOne as jest.Mock;
const mockDeleteMany = PasswordReset.deleteMany as jest.Mock;
const mockCreate = PasswordReset.create as jest.Mock;

describe("forgotPassword", () => {
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

  it("should return error if email is missing", async () => {
    const formData = new FormData();

    const result = await forgotPassword(formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Email is required");
  });

  it("should return success message even if user does not exist (security)", async () => {
    mockFindOne.mockResolvedValue(null);

    const formData = new FormData();
    formData.append("email", "nonexistent@example.com");

    const result = await forgotPassword(formData);

    expect(result.success).toBe(true);
    expect(result.message).toContain("If an account exists");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("should reject password reset for non-local providers", async () => {
    mockFindOne.mockResolvedValue({
      _id: "user123",
      email: "google@example.com",
      provider: "google",
    });

    const formData = new FormData();
    formData.append("email", "google@example.com");

    const result = await forgotPassword(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("external authentication");
  });

  it("should create reset token and send email for valid user", async () => {
    mockFindOne.mockResolvedValue({
      _id: "user123",
      email: "test@example.com",
      provider: "local",
    });
    mockDeleteMany.mockResolvedValue({});
    mockCreate.mockResolvedValue({});
    (sendEmail as jest.Mock).mockResolvedValue({ success: true, messageId: "123" });

    const formData = new FormData();
    formData.append("email", "test@example.com");

    const result = await forgotPassword(formData);

    expect(result.success).toBe(true);
    expect(result.message).toContain("If an account exists");
    expect(mockDeleteMany).toHaveBeenCalledWith({ userId: "user123" });
    expect(mockCreate).toHaveBeenCalled();

    // Verify the token was created with correct structure
    const createCall = mockCreate.mock.calls[0][0];
    expect(createCall).toHaveProperty("userId", "user123");
    expect(createCall).toHaveProperty("token");
    expect(createCall).toHaveProperty("expiresAt");
    expect(createCall.expiresAt.getTime()).toBeGreaterThan(Date.now());

    // Verify email was sent with reset link
    expect(sendEmail).toHaveBeenCalledWith(
        "test@example.com",
        expect.stringContaining("Password Reset"),
        expect.stringContaining("reset-password?token=")
    );
  });

  it("should return error if email sending fails", async () => {
    mockFindOne.mockResolvedValue({
      _id: "user123",
      email: "test@example.com",
      provider: "local",
    });
    mockDeleteMany.mockResolvedValue({});
    mockCreate.mockResolvedValue({});
    (sendEmail as jest.Mock).mockResolvedValue({
      success: false,
      error: "SMTP error",
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");

    const result = await forgotPassword(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Failed to send reset email");

    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith(
        "Failed to send reset email:",
        "SMTP error"
    );
  });

  it("should handle database errors gracefully", async () => {
    mockFindOne.mockRejectedValue(new Error("Database connection failed"));

    const formData = new FormData();
    formData.append("email", "test@example.com");

    const result = await forgotPassword(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("An error occurred");

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
        "Forgot password error:",
        expect.any(Error)
    );
  });

  it("should generate cryptographically secure token", async () => {
    mockFindOne.mockResolvedValue({
      _id: "user123",
      email: "test@example.com",
      provider: "local",
    });
    mockDeleteMany.mockResolvedValue({});
    mockCreate.mockResolvedValue({});
    (sendEmail as jest.Mock).mockResolvedValue({ success: true });

    const formData = new FormData();
    formData.append("email", "test@example.com");

    await forgotPassword(formData);

    const createCall = mockCreate.mock.calls[0][0];

    // Token should be an SHA-256 hash (64 hex characters)
    expect(createCall.token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should set token expiration to 1 hour from now", async () => {
    const now = Date.now();

    mockFindOne.mockResolvedValue({
      _id: "user123",
      email: "test@example.com",
      provider: "local",
    });
    mockDeleteMany.mockResolvedValue({});
    mockCreate.mockResolvedValue({});
    (sendEmail as jest.Mock).mockResolvedValue({ success: true });

    const formData = new FormData();
    formData.append("email", "test@example.com");

    await forgotPassword(formData);

    const createCall = mockCreate.mock.calls[0][0];
    const expiresAt = createCall.expiresAt.getTime();
    const oneHourFromNow = now + 3600000;

    // Should be approximately 1 hour from now (within 1 second tolerance)
    expect(expiresAt).toBeGreaterThanOrEqual(oneHourFromNow - 1000);
    expect(expiresAt).toBeLessThanOrEqual(oneHourFromNow + 1000);
  });
});