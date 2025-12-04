import { render, screen } from "@testing-library/react";
import { Navbar } from "./navbar";

// Mock do hook de auth para não correr efeitos nem mexer em localStorage
jest.mock("@/lib/hook/useAuth", () => ({
  useAuth: jest.fn(() => null), // sessão "carregada" mas sem user
}));

// Mock Link
jest.mock("next/link", () => ({ href, children }: any) => (
  <a href={href}>{children}</a>
));

describe("Navbar", () => {
  test('has a "Get started" button linking to /signup', () => {
    render(<Navbar />);

    const getStartedButton = screen.getByRole("link", { name: /get started/i });
    expect(getStartedButton).toHaveAttribute("href", "/signup");
  });

  test('has a "Log in" button linking to /login', () => {
    render(<Navbar />);

    const loginButton = screen.getByRole("link", { name: /log in/i });
    expect(loginButton).toHaveAttribute("href", "/login");
  });
});
