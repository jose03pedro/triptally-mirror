import { NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectionToDB();
  const trip = await Trip.findById(params.id);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trip);
}
