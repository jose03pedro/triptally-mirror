"use server";

import User from "@/app/models/User";
import { OAuth2Client } from "google-auth-library";
import connectionToDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {loginHandler} from "@/app/actions/login";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken)
      return NextResponse.json(
        { success: false, errors: { email: ["No token provided"] } },
        { status: 400 }
      );

    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email)
      return NextResponse.json(
        { success: false, errors: { email: ["Email not found in token"] } },
        { status: 400 }
      );

    const email = payload.email;
    const first_name = payload.given_name || "";
    const last_name = payload.family_name || "";

    await connectionToDB();

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but registered with a different provider, return error
      if (user.provider && user.provider !== "google") {
        return NextResponse.json(
          {
            success: false,
            errors: {
              email: [
                "This email was registered with a different login method.",
              ],
              password: [],
              first_name: [],
              last_name: [],
            },
          },
          { status: 400 }
        );
      }
    } else {
      // Create new Google user
      user = await User.create({
        email,
        first_name,
        last_name,
        provider: "google",
        password: undefined,
      });
    }

    // Generate JWT token
    const token = await loginHandler(user._id, user.email, user.first_name, user.last_name);

    return NextResponse.json({
      success: true,
      token,
      errors: { email: [], password: [], first_name: [], last_name: [] },
    });
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      {
        success: false,
        errors: {
          email: [error.message || "Auth failed"],
          password: [],
          first_name: [],
          last_name: [],
        },
      },
      { status: 500 }
    );
  }
}
