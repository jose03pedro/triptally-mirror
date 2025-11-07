import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
    await connectionToDB();
    try {
        const trip = await Trip.findById(params.id).lean();
        if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ trip });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
