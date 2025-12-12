import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Flight from "@/app/models/Flight";
import Trip from "@/app/models/Trip";

// List flights attached to a trip
export async function GET(
  request: NextRequest,
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

    const trip = await Trip.findById(id).populate("flights");
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    const flights = Array.isArray(trip.flights) ? trip.flights : [];
    return NextResponse.json(flights);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch flights" },
      { status: 500 }
    );
  }
}

// Attach a flight (number + date) to a trip
export async function POST(
  request: NextRequest,
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

    const body = await request.json();
    const { flightNumber, date } = body || {};

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Validate inputs
    const flNum: string | undefined = flightNumber;
    if (!flNum || !date) {
      return NextResponse.json(
        { error: "Missing flightNumber or date" },
        { status: 400 }
      );
    }

    const normalizedNumber = String(flNum).replace(/\s+/g, "").toUpperCase();
    // Match by day (date-only) since Flight.date is a Date
    const d = new Date(date);
    const start = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );
    const end = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)
    );

    // Find an already-cached flight for that number and day
    const existing = await Flight.findOne({
      flightNumber: normalizedNumber,
      date: d,
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Flight not found in cache; search first" },
        { status: 404 }
      );
    }

    const flightId = existing._id;
    const alreadyLinked =
      Array.isArray(trip.flights) &&
      trip.flights.some((f: any) => String(f) === String(flightId));
    if (!alreadyLinked) {
      trip.flights = [...(trip.flights || []), flightId];
      await trip.save();
    }

    return NextResponse.json(existing);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to add flight to trip" },
      { status: 500 }
    );
  }
}

// Remove flight association from a trip
export async function DELETE(
  request: NextRequest,
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

    const { flightId, flightNumber, date } = await request.json();
    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    let targetFlight: any = null;
    if (flightId) {
      targetFlight = await Flight.findById(flightId);
    } else if (flightNumber && date) {
      const normalizedNumber = String(flightNumber)
        .replace(/\s+/g, "")
        .toUpperCase();
      targetFlight = await Flight.findOne({
        flightNumber: normalizedNumber,
        date: new Date(date),
      });
    }

    if (!targetFlight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    // Remove association from trip
    trip.flights = (trip.flights || []).filter(
      (f: any) => String(f) !== String(targetFlight._id)
    );
    await trip.save();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to add flight to trip" },
      { status: 500 }
    );
  }
}
