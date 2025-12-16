import { NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import PackingItem from "@/app/models/PackingItem";
import Trip from "@/app/models/Trip";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

// GET - Fetch all packing items for a trip
export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!trip.isPublic && !isOwner) {
      return NextResponse.json({ error: "This trip is private" }, { status: 403 });
    }

    const items = await PackingItem.find({ trip: id })
      .sort({ required: -1, category: 1, name: 1 })
      .lean();

    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("Error fetching packing list:", err);
    return NextResponse.json({ error: "Failed to fetch packing list" }, { status: 500 });
  }
}

// POST - Create a single packing item manually
export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the trip owner can add packing items" },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    const existing = await PackingItem.findOne({
      trip: id,
      name: { $regex: new RegExp(`^${body.name.trim()}$`, "i") },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Item already exists in packing list" },
        { status: 409 }
      );
    }

    const item = await PackingItem.create({
      trip: id,
      name: body.name.trim(),
      category: body.category || "General",
      required: body.required ?? false,
      checked: body.checked ?? false,
      quantity: body.quantity ?? 1,
      source: body.source ?? "base",
      notes: body.notes?.trim() || undefined,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Error creating packing item:", err);
    return NextResponse.json({ error: "Failed to create packing item" }, { status: 500 });
  }
}

// PATCH - Toggle checked status or update item
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the trip owner can edit packing items" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { itemId, checked, name, category, required, quantity, notes } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {};
    if (typeof checked === "boolean") updateFields.checked = checked;
    if (name !== undefined) updateFields.name = name.trim();
    if (category !== undefined) updateFields.category = category;
    if (typeof required === "boolean") updateFields.required = required;
    if (quantity !== undefined) updateFields.quantity = quantity;
    if (notes !== undefined) updateFields.notes = notes?.trim() || undefined;

    const updatedItem = await PackingItem.findOneAndUpdate(
      { _id: itemId, trip: id },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: "Packing item not found" }, { status: 404 });
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (err) {
    console.error("Error updating packing item:", err);
    return NextResponse.json({ error: "Failed to update packing item" }, { status: 500 });
  }
}

// DELETE - Remove a packing item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the trip owner can delete packing items" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const deleted = await PackingItem.findOneAndDelete({ _id: itemId, trip: id });

    if (!deleted) {
      return NextResponse.json({ error: "Packing item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting packing item:", err);
    return NextResponse.json({ error: "Failed to delete packing item" }, { status: 500 });
  }
}
