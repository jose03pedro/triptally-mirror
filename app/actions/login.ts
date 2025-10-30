"use server";

import connectionToDB from "@/lib/mongoose";
import User from "../models/User";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthResponse } from "@/lib/definitions";
import {cookies} from "next/headers";

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
    const token = await loginHandler(user._id, user.email, user.first_name, user.last_name);

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

export async function loginHandler(id: string, email: string, first_name: string, last_name: string) {
    const token = jwt.sign(
        { user: {
                id: id,
                email: email,
                first_name: first_name,
                last_name: last_name
            }}, JWT_SECRET, {
            expiresIn: "24h",
        }
    );

    const cookieStore = await cookies();

    // Set the cookie
    cookieStore?.set({
        name: 'session',
        value: token,
        path: '/',               // available for all routes
        httpOnly: true,          // inaccessible via JS (more secure)
        sameSite: 'strict',      // CSRF protection
        maxAge: 60 * 60 * 24 // 24 h
    });

    return token;
}