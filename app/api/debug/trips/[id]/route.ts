import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await connectionToDB();
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("id");
    if (!tripId) {
        return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ trip });
}
