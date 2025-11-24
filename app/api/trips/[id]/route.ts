import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import Expense from "@/app/models/Expense";

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

    const tripDoc = await Trip.findById(id).populate(
      "user",
      "first_name last_name"
    );

    if (!tripDoc) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Build response similar to list endpoint: include createdByName for consistency
    const anyTrip: any = tripDoc;
    const u: any = anyTrip.user;
    const owner =
      u && (u.first_name || u.last_name)
        ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
        : "Unknown traveler";

    const trip = {
      _id: anyTrip._id,
      title: anyTrip.title,
      startDate: anyTrip.startDate,
      endDate: anyTrip.endDate,
      cities: anyTrip.cities,
      isPublic: anyTrip.isPublic,
      coverImage: anyTrip.coverImage,
      privacy: anyTrip.privacy,
      user: anyTrip.user,
      owner,
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
