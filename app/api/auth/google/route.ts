"use server";

import User from "@/app/models/User";
import { OAuth2Client } from "google-auth-library";
import connectionToDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken)
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 400 }
      );

    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error("Email not found in token");

    const email = payload.email;
    const first_name = payload.given_name || "";
    const last_name = payload.family_name || "";

    await connectionToDB();

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      await User.create({
        email,
        first_name,
        last_name,
        provider: "google",
        password: undefined,
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Auth failed" },
      { status: 500 }
    );
  }
}
