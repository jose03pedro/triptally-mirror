import Notification from "@/app/models/Notification";
import connectionToDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

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

    // Fetch the user and populate notifications
    const notifications = await Notification.find({ user: id })

      .populate({ path: "type", model: "NotificationType" })
      .sort({
        createdAt: -1,
      });

    // Return only the notifications
    return NextResponse.json(notifications || [], { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
