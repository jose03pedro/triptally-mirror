import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";

// GET - Get public trip by slug (no auth required)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectionToDB();

    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const tripDoc = await Trip.findOne({ publicSlug: slug })
      .populate("user", "first_name last_name avatar")
      .populate("currency")
      .populate("flights")
      .lean();

    if (!tripDoc || Array.isArray(tripDoc)) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const trip = tripDoc as any;

    // Check if trip is public
    if (!trip.isPublic) {
      return NextResponse.json(
        { error: "This trip is not publicly shared" },
        { status: 403 }
      );
    }

    // Return only fields allowed by privacy settings
    const response: any = {
      _id: trip._id,
      title: trip.title,
      startDate: trip.startDate,
      endDate: trip.endDate,
      owner: trip.user,
    };

    // Apply privacy filters
    if (trip.privacy?.showCities !== false) {
      response.cities = trip.cities;
    }

    if (trip.privacy?.showCover !== false) {
      response.coverImage = trip.coverImage;
    }

    // Note: expenses and itinerary are handled separately via their own endpoints
    // which also check privacy settings

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching public trip:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}

