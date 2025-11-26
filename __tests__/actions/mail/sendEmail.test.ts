// Create a stable mock transporter that will be used throughout
let mockSendMail = jest.fn();

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    get sendMail() {
      return mockSendMail;
    },
  })),
}));

// Mock the mail template
jest.mock("@/lib/mail/mail-template", () => ({
  __esModule: true,
  default: jest.fn((message: string) => `<html><body>${message}</body></html>`),
}));

// Import AFTER mocking
import { sendEmail } from "@/app/actions/mail/sendEmail";
import HTML_TEMPLATE from "@/lib/mail/mail-template";
import nodemailer from "nodemailer";

const mockCreateTransport = nodemailer.createTransport as jest.Mock;

describe("sendEmail", () => {
  // Suppress console logs in tests
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock function
    mockSendMail = jest.fn();
  });

  it("should send email successfully", async () => {
    mockSendMail.mockResolvedValue({ messageId: "test-message-123" });

    const result = await sendEmail(
      "test@example.com",
      "Test Subject",
      "Test message body"
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("test-message-123");

    // Verify sendMail was called with correct parameters
    expect(mockSendMail).toHaveBeenCalledWith({
      from: expect.stringContaining("TripTally"),
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test message body",
      html: expect.stringContaining("Test message body"),
    });
  });

  it("should use HTML template for email body", async () => {
    mockSendMail.mockResolvedValue({ messageId: "123" });

    await sendEmail("test@example.com", "Subject", "Message content");

    expect(HTML_TEMPLATE).toHaveBeenCalledWith("Message content");
  });

  it("should handle network timeouts", async () => {
    const timeoutError = new Error("Connection timeout");
    mockSendMail.mockRejectedValue(timeoutError);

    const result = await sendEmail(
      "test@example.com",
      "Test Subject",
      "Test message"
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("timeout");
  });

  it("should include both text and HTML versions", async () => {
    mockSendMail.mockResolvedValue({ messageId: "123" });

    await sendEmail("test@example.com", "Subject", "Plain text message");

    const callArgs = mockSendMail.mock.calls[0][0];
    expect(callArgs.text).toBe("Plain text message");
    expect(callArgs.html).toContain("Plain text message");
    expect(callArgs.html).toContain("<html>");
  });

  it("should format from address correctly", async () => {
    mockSendMail.mockResolvedValue({ messageId: "123" });

    await sendEmail("test@example.com", "Subject", "Message");

    const callArgs = mockSendMail.mock.calls[0][0];
    expect(callArgs.from).toMatch(/^".*TripTally.*" <.*@.*>$/);
  });

  it("should convert error to string in error response", async () => {
    const customError = { code: "EAUTH", message: "Authentication failed" };
    mockSendMail.mockRejectedValue(customError);

    const result = await sendEmail(
      "test@example.com",
      "Test Subject",
      "Test message"
    );

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe("string");
  });

  it("should handle errors without message property", async () => {
    mockSendMail.mockRejectedValue("Simple string error");

    const result = await sendEmail(
      "test@example.com",
      "Test Subject",
      "Test message"
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Simple string error");
  });

  it("should handle null/undefined errors gracefully", async () => {
    mockSendMail.mockRejectedValue(null);

    const result = await sendEmail(
      "test@example.com",
      "Test Subject",
      "Test message"
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("null");
  });
});
