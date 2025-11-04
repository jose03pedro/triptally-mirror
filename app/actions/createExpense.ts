"use server";

import connectionToDB from "@/lib/mongoose";
import Expense from "@/app/models/Expense";
import {getCurrentUser} from "@/lib/auth/getCurrentUser";

export async function createExpense(formData: FormData) {
    try {
        await connectionToDB();

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error("User not authenticated.");
            return { success: false, errors: { title: [], startDate: [], endDate: [], cities: [] } };
        }

        const tripId = formData.get("tripId") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const currency = formData.get("currency") as string;
        const date = formData.get("date") as string;

        const newExpense = await Expense.create({
            description,
            category,
            currency,
            date,
            trip: tripId,
        });

        return { success: true }
    } catch (e) {
        console.error(e);
        return { success: false };
    }
}