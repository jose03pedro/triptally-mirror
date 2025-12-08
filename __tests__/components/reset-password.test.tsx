/** @jest-environment jsdom */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the server action
jest.mock("@/app/actions/auth/resetPassword", () => ({
  resetPassword: jest.fn(),
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockGet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Import AFTER mocking
import ResetPasswordPage from "@/app/reset-password/page";
import { resetPassword } from "@/app/actions/auth/resetPassword";

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: provide a valid token
    mockGet.mockImplementation((key: string) =>
        key === "token" ? "valid-token-123" : null
    );
  });

  it("should render reset password form with valid token", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByRole("heading", { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  it("should show error if token is missing from URL", () => {
    mockGet.mockReturnValue(null);

    render(<ResetPasswordPage />);

    expect(screen.getByText(/invalid reset link/i)).toBeInTheDocument();

    // Form should be disabled
    const passwordInput = screen.getByPlaceholderText("Enter new password");
    expect(passwordInput).toBeDisabled();
  });

  it("should successfully reset password", async () => {
    (resetPassword as jest.Mock).mockResolvedValue({
      success: true,
      message: "Password reset successfully",
    });

    render(<ResetPasswordPage />);

    const newPasswordInput = screen.getByPlaceholderText("Enter new password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm new password");
    const submitBtn = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(newPasswordInput, { target: { value: "NewPass123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "NewPass123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/password reset successfully/i)).toBeInTheDocument();
    });

    // Should redirect to login after 3 seconds
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    }, { timeout: 3500 });
  });

  it("should display password validation errors", async () => {
    (resetPassword as jest.Mock).mockResolvedValue({
      success: false,
      message: "Invalid password",
      errors: {
        password: ["Password must be at least 8 characters"],
      },
    });

    render(<ResetPasswordPage />);

    const newPasswordInput = screen.getByPlaceholderText("Enter new password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm new password");
    const submitBtn = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(newPasswordInput, { target: { value: "weak" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "weak" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    // Password input should have error styling
    expect(newPasswordInput).toHaveClass("is-invalid");
  });

  it("should display token expiration error", async () => {
    (resetPassword as jest.Mock).mockResolvedValue({
      success: false,
      message: "Invalid token",
      errors: {
        token: ["This reset link has expired or is invalid"],
      },
    });

    render(<ResetPasswordPage />);

    const submitBtn = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "NewPass123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "NewPass123!" },
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/expired or is invalid/i)).toBeInTheDocument();
    });
  });

  it("should disable form while submitting", async () => {
    (resetPassword as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          success: true,
          message: "Success"
        }), 100))
    );

    render(<ResetPasswordPage />);

    const newPasswordInput = screen.getByPlaceholderText("Enter new password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm new password");
    const submitBtn = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(newPasswordInput, { target: { value: "NewPass123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "NewPass123!" } });
    fireEvent.click(submitBtn);

    // Should show loading state
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText("Resetting...")).toBeInTheDocument();
    expect(newPasswordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it("should require both password fields", () => {
    render(<ResetPasswordPage />);

    const newPasswordInput = screen.getByPlaceholderText("Enter new password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm new password");

    expect(newPasswordInput).toHaveAttribute("required");
    expect(confirmPasswordInput).toHaveAttribute("required");
    expect(newPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("should have link back to login page", () => {
    render(<ResetPasswordPage />);

    const loginLink = screen.getByText(/back to login/i).closest("a");
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("should send token in form submission", async () => {
    const testToken = "test-token-xyz";
    mockGet.mockImplementation((key: string) =>
        key === "token" ? testToken : null
    );

    (resetPassword as jest.Mock).mockResolvedValue({
      success: true,
      message: "Success",
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "NewPass123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "NewPass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalled();
    });

    // Verify token was included in FormData
    const formData = (resetPassword as jest.Mock).mock.calls[0][0];
    expect(formData.get("token")).toBe(testToken);
  });

  it("should clear errors on new submission", async () => {
    (resetPassword as jest.Mock)
        .mockResolvedValueOnce({
          success: false,
          errors: { password: ["First error"] },
        })
        .mockResolvedValueOnce({
          success: true,
          message: "Success",
        });

    render(<ResetPasswordPage />);

    const submitBtn = screen.getByRole("button", { name: /reset password/i });

    // First submission - error
    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "weak" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "weak" },
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    // Second submission - success
    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "StrongPass123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "StrongPass123!" },
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
});