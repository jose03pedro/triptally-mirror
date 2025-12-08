"use server";

import connectionToDB from "@/lib/mongoose";
import Expense from "@/app/models/Expense";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { ObjectId } from "mongoose";
import { EditExpenseSchema } from "@/lib/definitions";

interface PopulatedExpenseLean {
  _id: ObjectId;
  description: string;
  date: string;
  value: number;
  trip: ObjectId;

  category: {
    _id: ObjectId;
    name: string;
  } | null;

  currency: {
    _id: ObjectId;
    code: string;
    symbol: string;
  } | null;
}

export async function editExpense(prevState: any, formData: FormData) {
  try {
    await connectionToDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        expense: undefined,
        errors: {
          tripId: [],
          category: [],
          description: [],
          value: [],
          date: [],
          currency: [],
          form: ["User not authenticated."],
        },
      };
    }

    const rawData = {
      expenseId: formData.get("expenseId"),
      category: formData.get("category"),
      description: formData.get("description"),
      value: formData.get("value"),
      date: formData.get("date"),
      currency: formData.get("currency"),
    };

    const validated = EditExpenseSchema.safeParse(rawData);

    if (!validated.success) {
      const flat = validated.error.flatten();
      return {
        success: false,
        expense: undefined,
        errors: {
          tripId: [],
          category: flat.fieldErrors.category || [],
          description: flat.fieldErrors.description || [],
          value: flat.fieldErrors.value || [],
          date: flat.fieldErrors.date || [],
          currency: flat.fieldErrors.currency || [],
          form: [],
        },
      };
    }

    const { expenseId, category, description, value, date, currency } =
      validated.data;

    // Fetch existing expense
    const existingExpense = await Expense.findById(expenseId);
    if (!existingExpense) {
      return {
        success: false,
        expense: undefined,
        errors: {
          tripId: [],
          category: [],
          description: [],
          value: [],
          date: [],
          currency: [],
          form: ["Expense not found."],
        },
      };
    }

    // Check if any value actually changed
    const hasChanges =
      existingExpense.category?.toString() !== category ||
      existingExpense.description !== description ||
      existingExpense.value !== Number(value) ||
      existingExpense.date.toISOString().split("T")[0] !== date ||
      existingExpense.currency?.toString() !== currency;

    if (!hasChanges) {
      return {
        success: false,
        expense: undefined,
        errors: {
          tripId: [],
          category: [],
          description: [],
          value: [],
          date: [],
          currency: [],
          form: ["No changes detected."],
        },
      };
    }

    // Update only if there are changes
    const expenseDoc = await Expense.findByIdAndUpdate(
      expenseId,
      {
        category,
        description,
        value: Number(value),
        date,
        currency,
      },
      { new: true }
    );

    const populated = await Expense.findById(expenseDoc._id)
      .populate("category")
      .populate("currency")
      .lean<PopulatedExpenseLean>();

    return {
      success: true,
      expense: populated
        ? {
            ...populated,
            _id: populated._id.toString(),
            trip: populated.trip.toString(),
            category: populated.category
              ? {
                  ...populated.category,
                  _id: populated.category._id.toString(),
                }
              : null,
            currency: populated.currency
              ? {
                  ...populated.currency,
                  _id: populated.currency._id.toString(),
                }
              : null,
          }
        : undefined,
      errors: {
        tripId: [],
        category: [],
        description: [],
        value: [],
        date: [],
        currency: [],
        form: [],
      },
    };
  } catch (err) {
    console.error("Error updating expense:", err);
    return {
      success: false,
      expense: undefined,
      errors: {
        tripId: [],
        category: [],
        description: [],
        value: [],
        date: [],
        currency: [],
        form: ["An unexpected error occurred. Please try again."],
      },
    };
  }
}
