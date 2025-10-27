import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "./navbar";
import Link from "next/link";

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
