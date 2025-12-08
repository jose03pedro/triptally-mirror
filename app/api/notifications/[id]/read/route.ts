import connectionToDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import Notification from "@/app/models/Notification";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Update the read indicator
    const updated = await Notification.findOneAndUpdate(
      { _id: id },
      { read: true },
      { new: true }
    ).populate({ path: "type", model: "NotificationType" });

    if (!updated) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, notification: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
