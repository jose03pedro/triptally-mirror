// app/api/trips/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import { User } from "@/types/user/types";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

type StatusFilter = "all" | "upcoming" | "past" | "ongoing";

// Helper to compute trip status from dates
function computeTripStatus(startDate: Date, endDate: Date): "upcoming" | "ongoing" | "past" {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (today < start) return "upcoming";
  if (today > end) return "past";
  return "ongoing";
}

// POST - Create a new trip
export async function POST(req: NextRequest) {
  try {
    await connectionToDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, currency, startDate, endDate, cities, destinations } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!currency) {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: "Start date is required" },
        { status: 400 }
      );
    }

    if (!endDate) {
      return NextResponse.json(
        { error: "End date is required" },
        { status: 400 }
      );
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (parsedStartDate > parsedEndDate) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    // Accept either cities or destinations array
    const rawCities = cities || destinations || [];
    if (!Array.isArray(rawCities) || rawCities.length === 0) {
      return NextResponse.json(
        { error: "At least one destination is required" },
        { status: 400 }
      );
    }

    // Normalize cities/destinations to consistent structure
    const normalizedCities = rawCities.map((c: any) => {
      if (typeof c === "string") {
        // Plain string city name
        return { name: c, country: "Unknown" };
      }
      return {
        name: c.name || c.city || "Unknown",
        country: c.country || "Unknown",
        lat: c.lat,
        lon: c.lon,
      };
    });

    // Validate each city has a name
    for (const city of normalizedCities) {
      if (!city.name || city.name === "Unknown") {
        return NextResponse.json(
          { error: "Each destination must have a valid city name" },
          { status: 400 }
        );
      }
    }

    // Create trip
    const newTrip = await Trip.create({
      title: title.trim(),
      currency,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      cities: normalizedCities,
      user: currentUser.id,
      isPublic: false,
      currentPlanId: null,
      participants: [{ user: currentUser.id, role: "owner" }],
    });

    // Populate for response
    const populatedTrip = await Trip.findById(newTrip._id)
      .populate("user", "first_name last_name avatar email")
      .populate("currency")
      .lean();

    if (!populatedTrip || Array.isArray(populatedTrip)) {
      return NextResponse.json(
        { error: "Failed to create trip" },
        { status: 500 }
      );
    }

    const trip = populatedTrip as any;
    const status = computeTripStatus(trip.startDate, trip.endDate);

    return NextResponse.json(
      {
        _id: trip._id,
        title: trip.title,
        startDate: trip.startDate,
        endDate: trip.endDate,
        cities: trip.cities,
        currency: trip.currency,
        owner: trip.user,
        participants: trip.participants,
        isPublic: trip.isPublic,
        currentPlanId: trip.currentPlanId || null,
        status,
        createdAt: trip.createdAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating trip:", error);
    return NextResponse.json(
      { error: "Failed to create trip", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  await connectionToDB();

  try {
    const { searchParams } = new URL(req.url);

    const currentUser = await getCurrentUser();

    const q = (searchParams.get("q") || "").trim();
    const userId = searchParams.get("userId");
    const rawStatus = (searchParams.get("status") || "all") as StatusFilter;

    const pageParam = searchParams.get("page") || "1";
    const limitParam = searchParams.get("limit") || "12";

    const pageNum = Number.parseInt(pageParam, 10);
    const limitNum = Number.parseInt(limitParam, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 0) {
      return NextResponse.json(
        {
          message: "Invalid query parameters",
          error: "Page must be a number >= 1 and limit must be a number >= 0.",
        },
        { status: 400 }
      );
    }

    const page = pageNum;
    const limit = limitNum;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const now = new Date();

    let status: StatusFilter = ["ongoing", "upcoming", "past"].includes(
      rawStatus
    )
      ? rawStatus
      : "all";

    const query: any = {};

    if (userId) {
      if (currentUser?.id !== userId) query.isPublic = true;
      query.user = userId;
    } else {
      query.isPublic = true;
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { "cities.name": { $regex: q, $options: "i" } },
        { "cities.country": { $regex: q, $options: "i" } },
      ];
    }

    if (startDateParam) {
      const startDate = new Date(startDateParam);
      if (!isNaN(startDate.getTime())) {
        query.startDate = {
          ...(query.startDate || {}),
          $gte: startDate,
        };
      }
    }

    if (endDateParam) {
      const endDate = new Date(endDateParam);
      if (!isNaN(endDate.getTime())) {
        query.endDate = {
          ...(query.endDate || {}),
          $lte: endDate,
        };
      }
    }

    if (status === "ongoing") {
      query.startDate = {
        ...(query.startDate || {}),
        $lte: now,
      };
      query.endDate = {
        ...(query.endDate || {}),
        $gte: now,
      };
    } else if (status === "upcoming") {
      query.startDate = {
        ...(query.startDate || {}),
        $gt: now,
      };
    } else if (status === "past") {
      query.endDate = {
        ...(query.endDate || {}),
        $lt: now,
      };
    }

    let sort: any = { startDate: 1 };
    if (status === "past") {
      sort = { startDate: -1 };
    }

    const total = await Trip.countDocuments(query);

    if (limit === 0) {
      return NextResponse.json({
        items: [],
        page: 1,
        total,
        pages: 1,
      });
    }

    const skip = (page - 1) * limit;

    const trips = await Trip.find(query)
      .populate("user", "first_name last_name avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const items = trips.map((t) => {
      const anyTrip: any = t;
      const owner: User = anyTrip.user;

      return {
        _id: anyTrip._id,
        title: anyTrip.title,
        startDate: anyTrip.startDate,
        endDate: anyTrip.endDate,
        cities: anyTrip.cities,
        isPublic: anyTrip.isPublic,
        coverImage: anyTrip.coverImage,
        privacy: anyTrip.privacy,
        owner: owner,
      };
    });

    return NextResponse.json({
      items,
      page,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}
