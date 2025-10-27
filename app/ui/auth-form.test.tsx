import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthForm from "./auth-form";

// Mock signup action
jest.mock("../actions/signup", () => ({
  signup: jest.fn(() => Promise.resolve({ success: true })),
}));

describe("AuthForm", () => {
  test("renders all input fields for signup", () => {
    render(<AuthForm mode="signup" />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue/i })
    ).toBeInTheDocument();
  });

  test("renders only email and password fields for login", () => {
    render(<AuthForm mode="login" />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/last name/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue/i })
    ).toBeInTheDocument();
  });

  test("allows user to type in inputs", async () => {
    render(<AuthForm mode="signup" />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "mariana@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.type(screen.getByLabelText(/first name/i), "Mariana");
    await user.type(screen.getByLabelText(/last name/i), "Marques");

    expect(screen.getByLabelText(/email/i)).toHaveValue("mariana@example.com");
    expect(screen.getByLabelText(/password/i)).toHaveValue("Password123!");
    expect(screen.getByLabelText(/first name/i)).toHaveValue("Mariana");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Marques");
  });
});
