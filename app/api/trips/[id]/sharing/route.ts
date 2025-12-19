import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import crypto from "crypto";

// PATCH - Update sharing settings
export async function PATCH(
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
        { error: "Only trip owner can update sharing settings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isPublic, privacy, enableSharing } = body;

    // If enabling sharing, generate a public slug if it doesn't exist
    if (enableSharing && !trip.publicSlug) {
      // Generate a unique slug
      const slug = crypto.randomBytes(16).toString("hex");
      // Check for uniqueness (very unlikely collision, but check anyway)
      const existing = await Trip.findOne({ publicSlug: slug });
      if (!existing) {
        trip.publicSlug = slug;
      } else {
        // Retry with longer slug if collision
        trip.publicSlug = crypto.randomBytes(24).toString("hex");
      }
    }

    // If disabling sharing, remove public slug
    if (enableSharing === false) {
      trip.publicSlug = undefined;
    }

    if (typeof isPublic === "boolean") {
      trip.isPublic = isPublic;
    }

    if (privacy && typeof privacy === "object") {
      trip.privacy = {
        ...trip.privacy,
        ...privacy,
      };
    }

    await trip.save();

    return NextResponse.json(
      {
        trip: {
          _id: trip._id,
          isPublic: trip.isPublic,
          publicSlug: trip.publicSlug,
          privacy: trip.privacy,
        },
        publicUrl: trip.publicSlug
          ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/trips/public/${trip.publicSlug}`
          : null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating sharing settings:", error);
    return NextResponse.json(
      { error: "Failed to update sharing settings", details: error.message },
      { status: 500 }
    );
  }
}

