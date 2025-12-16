import { NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import PackingItem from "@/app/models/PackingItem";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { generatePackingItems, WeatherDay } from "@/lib/packing/generatePacking";

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

    const trip: any = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the trip owner can generate packing list" },
        { status: 403 }
      );
    }

    const startDate = trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : null;
    const endDate = trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 10) : null;
    const mainCity = trip.cities?.[0]?.name;

    let weatherDays: WeatherDay[] = [];

    if (mainCity && startDate && endDate) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const weatherRes = await fetch(
          `${baseUrl}/api/weather?city=${encodeURIComponent(mainCity)}&start=${startDate}&end=${endDate}`,
          { cache: "no-store" }
        );

        if (weatherRes.ok) {
          const weatherData = await weatherRes.json();
          weatherDays = weatherData.days || [];
        } else {
          console.warn("Weather API returned non-OK status, using base items only");
        }
      } catch (weatherErr) {
        console.warn("Failed to fetch weather, using base items only:", weatherErr);
      }
    }

    const itemsToCreate = generatePackingItems(
      weatherDays,
      startDate || undefined,
      endDate || undefined
    );

    const existingItems = await PackingItem.find({ trip: id }).lean();
    const existingNames = new Set(existingItems.map((item: any) => item.name.toLowerCase()));

    const newItems = itemsToCreate.filter(
      (item) => !existingNames.has(item.name.toLowerCase())
    );

    if (newItems.length === 0) {
      return NextResponse.json(
        { message: "Packing list is already up to date", itemsAdded: 0, totalItems: existingItems.length },
        { status: 200 }
      );
    }

    const createdItems = await PackingItem.insertMany(
      newItems.map((item) => ({
        trip: id,
        name: item.name,
        category: item.category,
        required: item.required,
        checked: false,
        quantity: 1,
        source: item.source,
      }))
    );

    return NextResponse.json(
      {
        message: "Packing list generated successfully",
        itemsAdded: createdItems.length,
        totalItems: existingItems.length + createdItems.length,
        items: createdItems,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error generating packing list:", err);
    return NextResponse.json({ error: "Failed to generate packing list" }, { status: 500 });
  }
}
