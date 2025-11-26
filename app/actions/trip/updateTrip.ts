// app/actions/updateTrip.ts
"use server";

import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

type UpdateTripState = {
  success: boolean;
  errors: Record<string, string[]>;
};

export async function updateTrip(
  _prevState: UpdateTripState,
  formData: FormData
): Promise<UpdateTripState> {
  await connectionToDB();

  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      errors: { _form: ["You must be logged in."] },
    };
  }

  const tripId = String(formData.get("tripId") || "");
  const title = String(formData.get("title") || "").trim();
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const currency = String(formData.get("currency") || "");
  const isPublic = formData.get("isPublic") === "on";

  const coverImage = String(formData.get("coverImage") || "").trim();

  const showCities = formData.get("privacy_showCities") === "on";
  const showExpenses = formData.get("privacy_showExpenses") === "on";
  const showItinerary = formData.get("privacy_showItinerary") === "on";
  const showCover = formData.get("privacy_showCover") === "on";

  if (!tripId || !title || !startDate || !endDate || !currency) {
    return {
      success: false,
      errors: { _form: ["All fields are required."] },
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return {
      success: false,
      errors: { _form: ["Invalid date range."] },
    };
  }

  // Parse cities
  const citiesJson = (formData.getAll("cities") as unknown[])
    .map((v) => String(v))
    .filter((s) => s && s.trim() !== "");

  const cities: any[] = [];
  for (const c of citiesJson) {
    try {
      cities.push(JSON.parse(c));
    } catch (err) {
      // ignore invalid json
    }
  }

  const normalizedCities = cities.map((ct) => ({
    name: ct.name,
    country: ct.country || "Unknown",
  }));

  const update: any = {
    title,
    startDate: start,
    endDate: end,
    cities: normalizedCities,
    isPublic,
    currency,
    privacy: {
      showCities,
      showExpenses,
      showItinerary,
      showCover,
    },
  };

  // Only update cover image if provided (non‑empty string)
  if (coverImage) {
    update.coverImage = coverImage;
  }

  const updated = await Trip.findOneAndUpdate(
    { _id: tripId, user: user.id },
    update,
    { new: true }
  );

  if (!updated) {
    return {
      success: false,
      errors: { _form: ["Trip not found or you are not the owner."] },
    };
  }

  return { success: true, errors: {} };
}
