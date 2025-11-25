import { NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Notification from "@/app/models/Notification";

export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Count unread notifications for this user
    const unreadCount = await Notification.countDocuments({
      user: id,
      read: false,
    });

    return NextResponse.json({ unreadCount }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch unread notification count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
