// external-auth-btn.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExternalAuthBtn } from "./external-auth-btn";

describe("ExternalAuthBtn", () => {
  beforeEach(() => {
    // Mock window.google for tests
    (window as any).google = {
      accounts: {
        id: {
          initialize: jest.fn(),
          prompt: jest.fn(),
        },
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("renders button with correct text and icon", () => {
    render(<ExternalAuthBtn provider="Google" />);

    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });
    expect(button).toBeInTheDocument();

    const img = screen.getByRole("img", { name: /google logo/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/icons/google.png");
  });

  test("calls Google initialize and prompt on click", async () => {
    render(<ExternalAuthBtn provider="Google" />);
    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });
    const user = userEvent.setup();

    await user.click(button);

    expect(window.google.accounts.id.initialize).toHaveBeenCalled();
    expect(window.google.accounts.id.prompt).toHaveBeenCalled();
  });

  test("does nothing if window.google is undefined", async () => {
    delete (window as any).google;
    render(<ExternalAuthBtn provider="Google" />);
    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });
    const user = userEvent.setup();

    await user.click(button);
  });
});
