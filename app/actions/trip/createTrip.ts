"use server";

import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { CreateTripSchema } from "@/lib/definitions";

export async function createTrip(prevState: any, formData: FormData) {
  try {
    await connectionToDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error("User not authenticated.");
      return {
        success: false,
        errors: {
          title: [],
          currency: [],
          startDate: [],
          endDate: [],
          cities: [],
        },
      };
    }

    const title = formData.get("title") as string;
    const currency = formData.get("currency") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    // parse city inputs, ignoring empty values
    const citiesJson = (formData.getAll("cities") as unknown[])
      .map((v) => String(v))
      .filter((s) => s && s.trim() !== "");

    const cities: any[] = [];
    for (const c of citiesJson) {
      try {
        cities.push(JSON.parse(c));
      } catch (err) {
        console.warn("createTrip: skipping invalid city payload", c, err);
      }
    }

    // Ensure required fields exist for storage (country is required in the
    // Mongoose schema). If the city comes from the free-text fallback it may
    // not have a country — normalize it here.
    const normalizedCities = cities.map((ct) => ({
      name: ct.name,
      country: ct.country || "Unknown",
      id: ct.id || undefined,
    }));

    const validatedFields = CreateTripSchema.safeParse({
      title,
      currency,
      startDate,
      endDate,
      cities: normalizedCities,
      isPublic: true,
    });

    if (!validatedFields.success) {
      const flat = validatedFields.error.flatten();
      return {
        success: false,
        errors: {
          title: flat.fieldErrors.title || [],
          currency: flat.fieldErrors.currency || [],
          startDate: flat.fieldErrors.startDate || [],
          endDate: flat.fieldErrors.endDate || [],
          cities: flat.fieldErrors.cities || [],
        },
      };
    }

    const newTrip = await Trip.create({
      title: validatedFields.data.title,
      currency: validatedFields.data.currency,
      startDate: validatedFields.data.startDate,
      endDate: validatedFields.data.endDate,
      cities: validatedFields.data.cities,
      user: currentUser.id,
      isPublic: false,
      currentPlanId: null,
      participants: [{ user: currentUser.id, role: "owner" }],
    });

    return {
      success: true,
      id: newTrip._id.toString(),
      errors: {
        title: [],
        currency: [],
        startDate: [],
        endDate: [],
        cities: [],
      },
    };
  } catch (error) {
    console.error("Error creating trips:", error);
    return {
      success: false,
      errors: {
        title: [],
        currency: [],
        startDate: [],
        endDate: [],
        cities: [],
      },
    };
  }
}
