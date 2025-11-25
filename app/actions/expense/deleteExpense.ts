"use server";

import connectionToDB from "@/lib/mongoose";
import Expense from "../../models/Expense";

export async function deleteExpense(expenseId: string) {
  try {
    await connectionToDB();

    // Get and delete the expense
    const deleted = await Expense.findByIdAndDelete(expenseId);

    if (!deleted) {
      throw new Error("Expense not found");
    }

    return { success: true, deletedId: expenseId };
  } catch (err) {
    console.error("deleteExpense: error connecting to DB", err);
    return { success: false };
  }
}
