"use server";

import connectionToDB from "@/lib/mongoose";
import User from "../../models/User";
import PasswordReset from "../../models/PasswordReset";
import crypto from "crypto";
import { sendEmail } from "../mail/sendEmail";

type ForgotPasswordResult = {
  success: boolean;
  message: string;
};

export async function forgotPassword(
  formData: FormData
): Promise<ForgotPasswordResult> {
  try {
    await connectionToDB();

    const email = formData.get("email") as string;

    if (!email) {
      return {
        success: false,
        message: "Email is required",
      };
    }

    // Find user
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return {
        success: true,
        message: "If an account exists, a reset link has been sent to your email.",
      };
    }

    // Only allow password reset for local accounts
    if (user.provider !== "local") {
      return {
        success: false,
        message: "This account uses external authentication. Please sign in with your provider.",
      };
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Create new reset token (expires in 1 hour)
    await PasswordReset.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Send email
    const emailResult = await sendEmail(
      email,
      "Password Reset Request - TripTally",
      `Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`
    );

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error);
      return {
        success: false,
        message: "Failed to send reset email. Please try again later.",
      };
    }

    return {
      success: true,
      message: "If an account exists, a reset link has been sent to your email.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      message: "An error occurred. Please try again later.",
    };
  }
}