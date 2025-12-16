import { NextResponse } from "next/server";

import connectionToDB from "@/lib/mongoose";
import User from "@/app/models/User";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET() {
  try {
    await connectionToDB();

    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const userDoc = await User.findById(currentUser.id).lean();
    if (!userDoc || Array.isArray(userDoc)) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    return NextResponse.json(
      {
        user: {
          id: (userDoc as any)._id.toString(),
          email: (userDoc as any).email || "",
          first_name: (userDoc as any).first_name || "",
          last_name: (userDoc as any).last_name || "",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("/api/auth/me error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
