"use server";

import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import {useAuth} from "@/lib/hook/useAuth";
import {getCurrentUser} from "@/lib/auth/getCurrentUser";

export async function createTrip(formData: FormData) {
    try {
        await connectionToDB();

        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("User not authenticated");

        const title = formData.get("title") as string;
        const startDate = formData.get("start-date") as string;
        const endDate = formData.get("end-date") as string;
        const citiesJson = formData.getAll("cities") as string[];
        const cities = citiesJson?.map(city => JSON.parse(city));

        await Trip.create({
            title,
            startDate,
            endDate,
            cities,
            user: currentUser.id,
        });
    } catch (error) {
        console.error("Error creating trip:", error);
    }
}