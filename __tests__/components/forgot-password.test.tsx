import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the server action
jest.mock("@/app/actions/auth/forgotPassword", () => ({
  forgotPassword: jest.fn(),
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Import AFTER mocking
import ForgotPasswordPage from "@/app/forgot-password/page";
import { forgotPassword } from "@/app/actions/auth/forgotPassword";

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render forgot password form", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  it("should display helper text", () => {
    render(<ForgotPasswordPage />);

    expect(
        screen.getByText(/enter your email address and we'll send you a link/i)
    ).toBeInTheDocument();
  });

  it("should display success message on successful submission", async () => {
    (forgotPassword as jest.Mock).mockResolvedValue({
      success: true,
      message: "Reset link sent successfully",
    });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const submitBtn = screen.getByRole("button", { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/reset link sent successfully/i)).toBeInTheDocument();
    });

    // Should have success alert styling
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("alert-success");
  });

  it("should display error message on failure", async () => {
    (forgotPassword as jest.Mock).mockResolvedValue({
      success: false,
      message: "An error occurred",
    });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const submitBtn = screen.getByRole("button", { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
    });

    // Should have error alert styling
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("alert-danger");
  });

  it("should disable button and show loading state while submitting", async () => {
    (forgotPassword as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          success: true,
          message: "Success"
        }), 100))
    );

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const submitBtn = screen.getByRole("button", { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitBtn);

    // Should show loading state
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText("Sending...")).toBeInTheDocument();
    expect(emailInput).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
      expect(screen.getByText(/send reset link/i)).toBeInTheDocument();
    });
  });

  it("should clear email field after successful submission", async () => {
    (forgotPassword as jest.Mock).mockResolvedValue({
      success: true,
      message: "Success",
    });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText("Enter your email") as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(emailInput.value).toBe("");
    });
  });

  it("should require email input", () => {
    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    expect(emailInput).toHaveAttribute("required");
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("should have link back to login page", () => {
    render(<ForgotPasswordPage />);

    const loginLink = screen.getByText(/back to login/i).closest("a");
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("should clear previous messages on new submission", async () => {
    (forgotPassword as jest.Mock)
        .mockResolvedValueOnce({
          success: false,
          message: "First error",
        })
        .mockResolvedValueOnce({
          success: true,
          message: "Success message",
        });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const submitBtn = screen.getByRole("button", { name: /send reset link/i });

    // First submission - error
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    // Second submission - success
    fireEvent.change(emailInput, { target: { value: "test2@example.com" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
      expect(screen.getByText("Success message")).toBeInTheDocument();
    });
  });
});