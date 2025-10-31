"use server";

import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";

export async function createTrip(formData: FormData) {
    try {
        await connectionToDB();

        const title = formData.get("title") as string;
        const startDate = formData.get("start-date") as string;
        const endDate = formData.get("end-date") as string;
        const cities = formData.getAll("cities") as string[];

        await Trip.create({
            title,
            startDate,
            endDate,
            cities,
        });
    } catch (error) {
        console.error("Error creating trip:", error);
    }
}