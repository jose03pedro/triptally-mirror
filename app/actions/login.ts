"use server";

import connectionToDB from "@/lib/mongoose";
import User from "../models/User";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthResponse, FormState } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function login(formData: FormData): Promise<AuthResponse> {
  try {
    await connectionToDB();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        token: undefined,
        errors: {
          email: ["No user found with this email."],
          password: [],
          first_name: [],
          last_name: [],
        },
      };
    }

    if (user.provider !== "local") {
      return {
        success: false,
        token: undefined,
        errors: {
          email: ["This email was registered with a different login method."],
          password: [],
          first_name: [],
          last_name: [],
        },
      };
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        token: undefined,
        errors: {
          email: [],
          password: ["Incorrect password."],
          first_name: [],
          last_name: [],
        },
      };
    }

    // Generate JWT token
    const token = jwt.sign(
        { user: {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }}, JWT_SECRET, {
          expiresIn: "24h",
        }
    );

    return {
      success: true,
      token,
      errors: {
        email: [],
        password: [],
        first_name: [],
        last_name: [],
      },
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      token: undefined,
      errors: {
        email: [],
        password: [],
        first_name: [],
        last_name: [],
      },
    };
  }
}
