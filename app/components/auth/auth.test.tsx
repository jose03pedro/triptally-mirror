import { render, screen } from "@testing-library/react";
import Auth from "./auth";

jest.mock("./auth-form", () => () => <div>Mock AuthForm</div>);
jest.mock("./external-auth-btn", () => ({
  ExternalAuthBtn: () => <button>Mock External Buttons</button>,
}));

describe("Auth", () => {
  test("renders correct h3 text for login mode", () => {
    render(<Auth mode="login" />);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Login your TripTally account");
  });

  test("renders correct h3 text for signup mode", () => {
    render(<Auth mode="signup" />);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Create your TripTally account");
  });

  test("renders ExternalAuthBtn and AuthForm components", () => {
    render(<Auth mode="signup" />);
    expect(screen.getByText("Mock External Buttons")).toBeInTheDocument();
    expect(screen.getByText("Mock AuthForm")).toBeInTheDocument();
  });
});
