"use server";

import connect from "@/lib/mongoose";
import { TravelerProfile } from "@/app/models/TravelerProfile";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function getTravelerProfile() {
  try {
    await connect();
    const user = await getCurrentUser();
    if (!user) return null;

    const profile = await TravelerProfile.findById(user.id).lean();
    if (!profile) return null;

    // Serialize _id and dates to plain objects/strings for Client Components
    return JSON.parse(JSON.stringify(profile));
  } catch (error) {
    console.error("Error fetching traveler profile:", error);
    return null;
  }
}