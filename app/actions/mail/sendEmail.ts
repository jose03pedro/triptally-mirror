"use server";

import nodemailer from "nodemailer";
import HTML_TEMPLATE from "@/lib/mail/mail-template";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, message: string) {
  try {
    const info = await transporter.sendMail({
      from: '"TripTally Support" <triptally@gmail.com>',
      to,
      subject,
      text: message,
      html: HTML_TEMPLATE(message),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
