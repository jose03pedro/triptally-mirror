import connectionToDB from "@/lib/mongoose";
import { TravelerProfile }from "@/app/models/TravelerProfile";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Promise<{ id: string }>}) {
    try {
        await connectionToDB();
        const { id } = await context.params;

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const profile = await TravelerProfile.findById(user.id).lean();

        if (!profile) {
            // Return null if no profile exists, but with a 200 OK status so the frontend knows it's not an error
            return new Response(JSON.stringify(null), { status: 200 });
        }

        return new Response(JSON.stringify(profile), { status: 200 });
    } catch (err) {
        console.error("Error fetching traveler profile:", err);
        return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
        });
    }
}