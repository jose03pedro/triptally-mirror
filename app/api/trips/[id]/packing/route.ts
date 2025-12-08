import { NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import PackingItem from "@/app/models/PackingItem";
import Trip from "@/app/models/Trip";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolved = await params;
    const { id } = resolved;

    const trip = await Trip.findById(id);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    // podes reutilizar a lógica de privacidade de expenses/trip se quiseres
    if (!trip.isPublic && !isOwner) {
      return NextResponse.json(
        { error: "This trip is private" },
        { status: 403 }
      );
    }

    const items = await PackingItem.find({ trip: id }).sort({
      required: -1,
      category: 1,
    });

    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch packing list" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolved = await params;
    const { id } = resolved;

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the owner can edit packing list" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const item = await PackingItem.create({
      trip: id,
      name: body.name,
      category: body.category || "General",
      required: body.required ?? false,
      checked: body.checked ?? false,
      quantity: body.quantity ?? 1,
      source: body.source ?? "base",
      notes: body.notes,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create packing item" },
      { status: 500 }
    );
  }
}
