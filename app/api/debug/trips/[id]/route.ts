import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    await connectionToDB();
    const { id } = params;
    const trip = await Trip.findById(id);
    return new Response(JSON.stringify({ trip }), {
        headers: { "Content-Type": "application/json" },
    });
}
