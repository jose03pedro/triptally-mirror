"use server";

import connectionToDB from "@/lib/mongoose";
import Expense from "@/app/models/Expense";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function createExpense(prevState: any, formData: FormData) {
  try {
    await connectionToDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false };

    const tripId = formData.get("tripId") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("category") as string;
    const currencyId = formData.get("currency") as string;
    const date = formData.get("date") as string;
    const valueStr = formData.get("value") as string;

    const value = Number(valueStr);
    if (isNaN(value)) throw new Error("Value is not a valid number");

    // Step 1: Create the expense
    const expenseDoc = await Expense.create({
      description,
      date,
      value,
      trip: tripId,
      category: categoryId,
      currency: currencyId,
    });

    // Step 2: Populate category and currency
    const populatedExpense = await Expense.findById(expenseDoc._id)
      .populate("category")
      .populate("currency")
      .lean(); // convert to plain JS object

    // Step 3: Convert ObjectIds to strings if needed
    const expenseJSON = {
      ...populatedExpense,
      _id: populatedExpense._id.toString(),
      trip: populatedExpense.trip.toString(),
      category: populatedExpense.category
        ? {
            ...populatedExpense.category,
            _id: populatedExpense.category._id.toString(),
          }
        : null,
      currency: populatedExpense.currency
        ? {
            ...populatedExpense.currency,
            _id: populatedExpense.currency._id.toString(),
          }
        : null,
    };

    return { success: true, expense: expenseJSON };
  } catch (e) {
    console.error("Error creating expense:", e);
    return { success: false };
  }
}
