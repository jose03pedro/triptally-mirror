import connectionToDB from "@/lib/mongoose";
import { TravelerProfile } from "@/app/models/TravelerProfile";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
){
    try {
        await connectionToDB();
        const { id } = await context.params;

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // For now we use the current user ID; the route param exists for future expansion.
        void id;

        const profile = await TravelerProfile.findById(user.id).lean();

        if (!profile) {
            return NextResponse.json(null, { status: 200 });
        }

        return NextResponse.json(profile, { status: 200 });
    } catch (err) {
        console.error("Error fetching traveler profile:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}