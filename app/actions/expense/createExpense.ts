"use server";

import connectionToDB from "@/lib/mongoose";
import Expense from "@/app/models/Expense";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { CreateExpenseSchema } from "@/lib/definitions";
import { ObjectId } from "mongoose";

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

export async function createExpense(prevState: any, formData: FormData) {
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
      tripId: formData.get("tripId"),
      category: formData.get("category"),
      description: formData.get("description"),
      value: formData.get("value"),
      date: formData.get("date"),
      currency: formData.get("currency"),
    };

    const validated = CreateExpenseSchema.safeParse(rawData);

    if (!validated.success) {
      const flat = validated.error.flatten();
      return {
        success: false,
        expense: undefined,
        errors: {
          tripId: flat.fieldErrors.tripId || [],
          category: flat.fieldErrors.category || [],
          description: flat.fieldErrors.description || [],
          value: flat.fieldErrors.value || [],
          date: flat.fieldErrors.date || [],
          currency: flat.fieldErrors.currency || [],
          form: [],
        },
      };
    }

    const { tripId, category, description, value, date, currency } =
      validated.data;

    const expenseDoc = await Expense.create({
      trip: tripId,
      category,
      description,
      value: Number(value),
      date,
      currency,
    });

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
    console.error("Error creating expense:", err);
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
