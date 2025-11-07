import { NextRequest, NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";

export async function GET(req: NextRequest) {
  await connectionToDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const userId = searchParams.get("userId");
  const upcoming = searchParams.get("upcoming");
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 12);
  const match: any = {};
  // If a userId is provided, return that user's trips (ignore isPublic).
  if (!userId) {
    match.isPublic = true;
  } else {
    match.user = userId;
    if (upcoming) {
      match.startDate = { $gte: new Date() };
    }
  }
  if (q) {
    match.$or = [
      { title: { $regex: q, $options: "i" } },
      { "cities.name": { $regex: q, $options: "i" } },
      { "cities.country": { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Trip.find(match).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Trip.countDocuments(match),
  ]);

  return NextResponse.json({ items, page, total, pages: Math.ceil(total / limit) });
}

