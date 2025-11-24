import Trip from "@/app/models/Trip";
import User from "@/app/models/User";
import connectionToDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

interface Body {
  tripId: string;
}

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

    // Fetch the user and populate savedTrips and the user of each trip
    const userDoc = await User.findById(id).populate({
      path: "savedTrips",
      populate: { path: "user", select: "first_name last_name" }, // nested populate
    });

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Map over savedTrips to include the owner info
    const trips = (userDoc.savedTrips || []).map((trip: any) => {
      const owner = trip.user
        ? {
            _id: trip.user._id,
            first_name: trip.user.first_name,
            last_name: trip.user.last_name,
          }
        : null;

      return {
        _id: trip._id,
        title: trip.title,
        startDate: trip.startDate,
        endDate: trip.endDate,
        cities: trip.cities,
        isPublic: trip.isPublic,
        coverImage: trip.coverImage,
        privacy: trip.privacy,
        owner,
      };
    });

    return NextResponse.json(trips, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectionToDB();

    // Await params to unwrap the promise
    const { id: userId } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const body: Body = await request.json();
    const { tripId } = body;

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tripDoc = await Trip.findById(tripId);
    if (!tripDoc) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Add trip to user's savedTrips array if not already saved
    if (!userDoc.savedTrips.includes(tripDoc._id)) {
      userDoc.savedTrips.push(tripDoc._id);
      await userDoc.save();
    }

    return NextResponse.json(
      { message: "Trip saved successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save trip" }, { status: 500 });
  }
}
