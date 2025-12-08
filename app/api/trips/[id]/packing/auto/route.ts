import { NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import PackingItem from "@/app/models/PackingItem";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { generatePackingItems } from "@/lib/packing/generatePacking";

export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolved = await params;
    const { id } = resolved;

    const trip: any = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the owner can generate packing list" },
        { status: 403 }
      );
    }

    // 1) buscar weather
    const mainCity = trip.cities?.[0];
    const start = trip.startDate.toISOString().slice(0, 10);
    const end = trip.endDate.toISOString().slice(0, 10);

    const weatherRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather?city=${encodeURIComponent(
        mainCity
      )}&start=${start}&end=${end}`
    );

    if (!weatherRes.ok) {
      return NextResponse.json(
        { error: "Failed to get weather for packing" },
        { status: 500 }
      );
    }

    const { days } = await weatherRes.json();

    // 2) gerar items
    const itemsToCreate = generatePackingItems(days);

    // 3) evitar duplicados
    const existing = await PackingItem.find({ trip: id });
    const existingNames = new Set(
      existing.map((i: any) => i.name.toLowerCase())
    );

    const filtered = itemsToCreate.filter(
      (i) => !existingNames.has(i.name.toLowerCase())
    );

    if (!filtered.length) {
      return NextResponse.json(
        { message: "Packing list already up to date" },
        { status: 200 }
      );
    }

    const created = await PackingItem.insertMany(
      filtered.map((i) => ({
        ...i,
        trip: id,
      }))
    );

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate packing list" },
      { status: 500 }
    );
  }
}
