"use server";

import connectionToDB from "@/lib/mongoose";
import Expense from "@/app/models/Expense";
import {getCurrentUser} from "@/lib/auth/getCurrentUser";

export async function createExpense(prevState: any, formData: FormData) {
    try {
        await connectionToDB();

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error("User not authenticated.");
            return { success: false };
        }

        const tripId = formData.get("tripId") as string;
        const description = formData.get("description") as string;
        const categoryId = formData.get("category") as string;
        const currencyId = formData.get("currency") as string;
        const date = formData.get("date") as string;
        const valueStr = formData.get("value") as string;

        const value = Number(valueStr);
        if (isNaN(value)) throw new Error("Value is not a valid number");

        await Expense.create({
            description,
            date,
            value,
            trip: tripId,
            category: categoryId,
            currency: currencyId,
        });

        return { success: true };
    } catch (e) {
        console.error("Error creating expense:", e);
        return { success: false };
    }
}
