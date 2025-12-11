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
      .populate("user", "first_name last_name")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const items = trips.map((t) => {
      const anyTrip: any = t;
      const u: any = anyTrip.user;

      return {
        _id: anyTrip._id,
        title: anyTrip.title,
        startDate: anyTrip.startDate,
        endDate: anyTrip.endDate,
        cities: anyTrip.cities,
        isPublic: anyTrip.isPublic,
        coverImage: anyTrip.coverImage,
        privacy: anyTrip.privacy,
        owner: anyTrip.user,
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
