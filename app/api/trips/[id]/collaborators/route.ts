import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

// GET - List collaborators for a trip
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectionToDB();

    const { id: tripId } = await context.params;

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const trip = await Trip.findById(tripId)
      .populate("participants.user", "first_name last_name email avatar")
      .populate("user", "first_name last_name email avatar");

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Check if user is owner or collaborator
    const isOwner = trip.user?.toString() === currentUser.id;
    const isCollaborator = trip.participants?.some(
      (p: any) => p.user?._id?.toString() === currentUser.id || p.user?.toString() === currentUser.id
    );

    if (!isOwner && !isCollaborator) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Return participants (includes owner)
    const collaborators = (trip.participants || []).map((p: any) => ({
      user: p.user,
      role: p.role,
    }));

    return NextResponse.json({ collaborators }, { status: 200 });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}

