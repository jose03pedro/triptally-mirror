import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import Invite from "@/app/models/Invite";
import User from "@/app/models/User";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import crypto from "crypto";

// POST - Create an invite
export async function POST(
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

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Check if user is owner
    const isOwner = trip.user?.toString() === currentUser.id;
    if (!isOwner) {
      return NextResponse.json(
        { error: "Only trip owner can invite collaborators" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, userId } = body;

    if (!email && !userId) {
      return NextResponse.json(
        { error: "Either email or userId is required" },
        { status: 400 }
      );
    }

    // If email provided, check if user exists
    let invitedUserId: string | undefined;
    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        invitedUserId = user._id.toString();
        // Check if already a collaborator
        const isAlreadyCollaborator = trip.participants?.some(
          (p: any) => p.user?.toString() === invitedUserId
        );
        if (isAlreadyCollaborator) {
          return NextResponse.json(
            { error: "User is already a collaborator" },
            { status: 400 }
          );
        }
      }
    } else if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      invitedUserId = userId;
      // Check if already a collaborator
      const isAlreadyCollaborator = trip.participants?.some(
        (p: any) => p.user?.toString() === invitedUserId
      );
      if (isAlreadyCollaborator) {
        return NextResponse.json(
          { error: "User is already a collaborator" },
          { status: 400 }
        );
      }
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");

    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await Invite.create({
      tripId,
      invitedEmail: email?.toLowerCase(),
      invitedUserId: invitedUserId ? invitedUserId : undefined,
      token,
      status: "pending",
      expiresAt,
      invitedBy: currentUser.id,
    });

    return NextResponse.json(
      {
        invite: {
          _id: invite._id,
          tripId: invite.tripId,
          invitedEmail: invite.invitedEmail,
          invitedUserId: invite.invitedUserId,
          token: invite.token,
          status: invite.status,
          expiresAt: invite.expiresAt,
          createdAt: invite.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}

// GET - List invites for a trip
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

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Check if user is owner
    const isOwner = trip.user?.toString() === currentUser.id;
    if (!isOwner) {
      return NextResponse.json(
        { error: "Only trip owner can view invites" },
        { status: 403 }
      );
    }

    const invites = await Invite.find({ tripId })
      .populate("invitedBy", "first_name last_name email")
      .populate("invitedUserId", "first_name last_name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ invites }, { status: 200 });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}

