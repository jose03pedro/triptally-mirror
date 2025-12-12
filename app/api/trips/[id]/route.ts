import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectionToDB();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    const tripDoc = await Trip.findById(id)
      .populate("user", "first_name last_name")
      .populate("currency")
      .populate("flights");

    const currentUser = await getCurrentUser();

    const ownerRaw = tripDoc.user ?? tripDoc.owner;
    const ownerId =
      ownerRaw == null
        ? undefined
        : typeof ownerRaw === "string"
          ? ownerRaw
          : ownerRaw._id != null
            ? String(ownerRaw._id)
            : typeof ownerRaw.toString === "function"
              ? ownerRaw.toString()
              : undefined;

    const isOwner = !!(currentUser && ownerId && currentUser.id === ownerId);

    if (!tripDoc.isPublic && !isOwner) {
      return NextResponse.json(
        { error: "This trip is private" },
        { status: 403 }
      );
    }

    const trip = {
      _id: tripDoc._id,
      title: tripDoc.title,
      startDate: tripDoc.startDate,
      endDate: tripDoc.endDate,
      cities: tripDoc.cities,
      isPublic: tripDoc.isPublic,
      coverImage: tripDoc.coverImage,
      privacy: tripDoc.privacy,
      currency: tripDoc.currency,
      owner: tripDoc.user,
      flights: tripDoc.flights,
    };

    return NextResponse.json(trip, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}
