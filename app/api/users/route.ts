// app/api/users/route.ts
import { NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import User from "@/app/models/User";

export async function GET() {
  try {
    await connectionToDB();

    const users = await User.find({});

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error("Error fetching users:", error.message || error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
