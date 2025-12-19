import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Invite from "@/app/models/Invite";
import Trip from "@/app/models/Trip";
import User from "@/app/models/User";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

// POST - Accept an invite
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    await connectionToDB();

    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { error: "Invite token is required" },
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

    const invite = await Invite.findOne({ token });
    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "Invite is no longer valid" },
        { status: 400 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "Invite has expired" },
        { status: 400 }
      );
    }

    // Verify email match if email was provided
    if (invite.invitedEmail) {
      const user = await User.findById(currentUser.id);
      if (!user || user.email.toLowerCase() !== invite.invitedEmail) {
        return NextResponse.json(
          { error: "This invite was sent to a different email" },
          { status: 403 }
        );
      }
    }

    // Verify userId match if userId was provided
    if (invite.invitedUserId) {
      if (invite.invitedUserId.toString() !== currentUser.id) {
        return NextResponse.json(
          { error: "This invite was sent to a different user" },
          { status: 403 }
        );
      }
    }

    const trip = await Trip.findById(invite.tripId);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Check if already a collaborator
    const isAlreadyCollaborator = trip.participants?.some(
      (p: any) => p.user?.toString() === currentUser.id
    );
    if (isAlreadyCollaborator) {
      // Mark invite as accepted anyway
      invite.status = "accepted";
      await invite.save();
      return NextResponse.json(
        { message: "You are already a collaborator", tripId: trip._id },
        { status: 200 }
      );
    }

    // Add user as collaborator (viewer role by default)
    if (!trip.participants) {
      trip.participants = [];
    }
    trip.participants.push({
      user: currentUser.id,
      role: "viewer",
    });

    // Also add to legacy collaborators array for backward compatibility
    if (!trip.collaborators) {
      trip.collaborators = [];
    }
    if (!trip.collaborators.includes(currentUser.id as any)) {
      trip.collaborators.push(currentUser.id as any);
    }

    await trip.save();

    // Mark invite as accepted
    invite.status = "accepted";
    await invite.save();

    return NextResponse.json(
      {
        message: "Invite accepted successfully",
        tripId: trip._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    );
  }
}

