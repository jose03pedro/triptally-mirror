"use server";

import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import {getCurrentUser} from "@/lib/auth/getCurrentUser";
import {CreateTripSchema} from "@/lib/definitions";

export async function createTrip(formData: FormData)  {
    try {
        await connectionToDB();

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error("User not authenticated.");
            return { success: false, errors: { title: [], startDate: [], endDate: [], cities: [] } };
        }

        const title = formData.get("title") as string;
        const startDate = formData.get("startDate") as string;
        const endDate = formData.get("endDate") as string;
        const citiesJson = formData.getAll("cities") as string[];
        const cities = citiesJson?.map(city => JSON.parse(city));

        const validatedFields = CreateTripSchema.safeParse({
            title,
            startDate,
            endDate,
            cities,
        });

        if (!validatedFields.success) {
            const flat = validatedFields.error.flatten();
            return {
                success: false,
                errors: {
                    title: flat.fieldErrors.title || [],
                    startDate: flat.fieldErrors.startDate || [],
                    endDate: flat.fieldErrors.endDate || [],
                    cities: flat.fieldErrors.cities || [],
                },
            };
        }

        const newTrip = await Trip.create({
            title: validatedFields.data.title,
            startDate: validatedFields.data.startDate,
            endDate : validatedFields.data.endDate,
            cities: validatedFields.data.cities,
            user: currentUser.id,
        });

        return { success: true, id: newTrip._id.toString(), errors: { title: [], startDate: [], endDate: [], cities: [] } };
    } catch (error) {
        console.error("Error creating trips:", error);
        return { success: false, errors: { title: [], startDate: [], endDate: [], cities: [] } };
    }
}