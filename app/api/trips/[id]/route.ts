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

    const tripDoc = await Trip.findById(id)
      .populate("user", "first_name last_name")
      .populate("currency");

    const currentUser = await getCurrentUser();

    const isOwner =
      currentUser && tripDoc.user.toString() === currentUser.id;

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
