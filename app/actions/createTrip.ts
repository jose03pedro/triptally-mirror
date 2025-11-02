"use server";

import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import {getCurrentUser} from "@/lib/auth/getCurrentUser";

export async function createTrip(prevState: any, formData: FormData)  {
    try {
        await connectionToDB();

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error("User not authenticated.");
            return { success: false };
        }

        const title = formData.get("title") as string;
        const startDate = formData.get("start-date") as string;
        const endDate = formData.get("end-date") as string;
        const citiesJson = formData.getAll("cities") as string[];
        const cities = citiesJson?.map(city => JSON.parse(city));

        const newTrip = await Trip.create({
            title,
            startDate,
            endDate,
            cities,
            user: currentUser.id,
        });

        return { success: true, id: newTrip._id.toString() };
    } catch (error) {
        console.error("Error creating trips:", error);
        return { success: false };
    }
}