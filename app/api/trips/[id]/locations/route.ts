import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { LocationCategory, LocationPriority, MustVisitLocation } from "@/types/location/types";

// GET - List all must-visit locations for a trip
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

    const trip = await Trip.findById(id).select("mustVisitLocations user isPublic");
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner = currentUser && String(trip.user) === currentUser.id;

    // Check access
    if (!trip.isPublic && !isOwner) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Convert _id to string for each location
    const locations = (trip.mustVisitLocations || []).map((loc: any) => {
      const locObj = loc.toObject ? loc.toObject() : loc;
      return { ...locObj, _id: String(locObj._id) };
    });

    return NextResponse.json(locations);
  } catch (e) {
    console.error("Error fetching locations:", e);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

// POST - Add a new must-visit location to a trip
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

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Only owner can add locations
    if (String(trip.user) !== currentUser.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { name, category, address, coordinates, placeId, notes, priority } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Location name is required" },
        { status: 400 }
      );
    }

    const newLocation = {
      name: name.trim(),
      category: (category as LocationCategory) || "custom",
      address: address?.trim() || undefined,
      coordinates: coordinates || undefined,
      placeId: placeId || undefined,
      notes: notes?.trim() || undefined,
      priority: (priority as LocationPriority) || 2,
      addedAt: new Date(),
    };

    trip.mustVisitLocations = trip.mustVisitLocations || [];
    trip.mustVisitLocations.push(newLocation);
    await trip.save();

    // Return the newly added location (last one in array) with _id as string
    const savedTrip = await Trip.findById(id).select("mustVisitLocations").lean() as { mustVisitLocations?: MustVisitLocation[] } | null;
    const addedLocation = savedTrip?.mustVisitLocations?.[savedTrip.mustVisitLocations.length - 1];
    if (addedLocation) {
      // Convert to plain JSON-serializable object
      const response = JSON.parse(JSON.stringify(addedLocation));
      return NextResponse.json(response, { status: 201 });
    }
    return NextResponse.json({ error: "Failed to retrieve added location" }, { status: 500 });
  } catch (e) {
    console.error("Error adding location:", e);
    return NextResponse.json(
      { error: "Failed to add location" },
      { status: 500 }
    );
  }
}

// PUT - Update a must-visit location
export async function PUT(
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

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (String(trip.user) !== currentUser.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { locationId, name, category, address, coordinates, notes, priority } = body;

    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    const locationIndex = trip.mustVisitLocations?.findIndex(
      (loc: any) => String(loc._id) === locationId
    );

    if (locationIndex === -1 || locationIndex === undefined) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Update fields if provided
    const location = trip.mustVisitLocations[locationIndex];
    if (name !== undefined) location.name = name.trim();
    if (category !== undefined) location.category = category;
    if (address !== undefined) location.address = address?.trim() || undefined;
    if (coordinates !== undefined) location.coordinates = coordinates;
    if (notes !== undefined) location.notes = notes?.trim() || undefined;
    if (priority !== undefined) location.priority = priority;

    await trip.save();

    return NextResponse.json(trip.mustVisitLocations[locationIndex]);
  } catch (e) {
    console.error("Error updating location:", e);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a must-visit location from a trip
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

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (String(trip.user) !== currentUser.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { locationId } = await request.json();

    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    const initialLength = trip.mustVisitLocations?.length || 0;
    trip.mustVisitLocations = (trip.mustVisitLocations || []).filter(
      (loc: any) => String(loc._id) !== locationId
    );

    if (trip.mustVisitLocations.length === initialLength) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    await trip.save();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error deleting location:", e);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}
