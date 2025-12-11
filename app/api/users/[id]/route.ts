import connectionToDB from "@/lib/mongoose";
import {NextResponse} from "next/server";
import { User as UserType } from "@/types/user/types";
import User from "@/app/models/User";
import {TravelerProfile} from "@/app/models/TravelerProfile";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectionToDB();

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const user = await User.findById(id)
            .select("first_name last_name avatar")
            .lean();

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const travelerProfile = await TravelerProfile.findById(id).lean();

        return NextResponse.json({ user, travelerProfile }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}