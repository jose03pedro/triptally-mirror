// app/api/trips/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";

type StatusFilter = "all" | "upcoming" | "past" | "ongoing";

export async function GET(req: NextRequest) {
  await connectionToDB();

  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const userId = searchParams.get("userId");
    const rawStatus = (searchParams.get("status") ||
      "all") as StatusFilter;

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );
    const limitRaw =
      Number.parseInt(searchParams.get("limit") || "12", 10) || 12;
    const limit = Math.max(0, limitRaw); // 0 = we only want the total

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const now = new Date();

    let status: StatusFilter = ["ongoing", "upcoming", "past"].includes(
      rawStatus
    )
      ? rawStatus
      : "all";

    // -----------------------
    // Build Mongo query
    // -----------------------
    const query: any = {};

    // If `userId` is present → return that user's trips.
    // If not present → return only public trips (homepage / explore).
    if (userId) {
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

    // Temporal status filtering
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

    // -----------------------
    // Sorting
    // -----------------------
    let sort: any = { startDate: 1 };
    if (status === "past") {
      sort = { startDate: -1 };
    }

    const total = await Trip.countDocuments(query);

    // Special case: limit = 0 → only want total (used for tab counts)
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
      .populate("user", "first_name last_name")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const items = trips.map((t) => {
      const anyTrip: any = t;
      const u: any = anyTrip.user;

      const createdByName =
        u && (u.first_name || u.last_name)
          ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
          : "Unknown traveler";

      return {
        _id: anyTrip._id,
        title: anyTrip.title,
        startDate: anyTrip.startDate,
        endDate: anyTrip.endDate,
        cities: anyTrip.cities,
        isPublic: anyTrip.isPublic,
        coverImage: anyTrip.coverImage,
        privacy: anyTrip.privacy,
        createdByName,
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
