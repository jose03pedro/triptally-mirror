"use server";

import connectionToDB from "@/lib/mongoose";
import User from "@/app/models/User";
import PasswordReset from "@/app/models/PasswordReset";
import { hash } from "bcrypt";
import crypto from "crypto";
import { ChangePasswordSchema } from "@/lib/definitions";

type ResetPasswordResult = {
  success: boolean;
  message: string;
  errors?: {
    password?: string[];
    token?: string[];
  };
};

export async function resetPassword(
  formData: FormData
): Promise<ResetPasswordResult> {
  try {
    await connectionToDB();

    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token) {
      return {
        success: false,
        message: "Invalid or missing reset token",
        errors: { token: ["Token is required"] },
      };
    }

    // Validate password
    const validation = ChangePasswordSchema.safeParse({ password });
    if (!validation.success) {
      const flat = validation.error.flatten();
      return {
        success: false,
        message: "Invalid password",
        errors: { password: flat.fieldErrors.password || [] },
      };
    }

    // Check passwords match
    if (password !== confirmPassword) {
      return {
        success: false,
        message: "Passwords do not match",
        errors: { password: ["Passwords must match"] },
      };
    }

    // Hash the token to match database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid reset token
    const resetEntry = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    if (!resetEntry) {
      return {
        success: false,
        message: "Invalid or expired reset token",
        errors: { token: ["This reset link has expired or is invalid"] },
      };
    }

    // Update user password
    const hashedPassword = await hash(password, 10);
    await User.findByIdAndUpdate(resetEntry.userId, {
      password: hashedPassword,
    });

    // Delete used token
    await PasswordReset.deleteOne({ _id: resetEntry._id });

    return {
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: "An error occurred. Please try again later.",
    };
  }
}