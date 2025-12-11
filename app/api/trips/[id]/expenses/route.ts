"use server";

import connectionToDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import Expense from "@/app/models/Expense";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import Trip from "@/app/models/Trip";
import { getExchangeRates } from "@/lib/utils/helperFunctions";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    const trip = await Trip.findById(id).populate("currency");

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    const currentUser = await getCurrentUser();

    const isOwner =
      currentUser && trip && trip.user.toString() === currentUser.id;

    if (!trip?.isPublic && !isOwner) {
      return NextResponse.json(
        { error: "This trip is private" },
        { status: 403 }
      );
    }


    const tripCurrencyCode = trip?.currency?.code;

    const expenses = await Expense.find({ trip: id })
      .populate({ path: "category", model: "ExpenseCategory" })
      .populate("currency");

    const expensesCurrencies = [
      ...new Set(
        expenses
          .filter((e) => e.currency.code !== tripCurrencyCode)
          .map((e) => e.currency.code)
      ),
    ];

    const rates = await getExchangeRates(tripCurrencyCode, expensesCurrencies);

    console.log(rates);

    const convertedExpenses = expenses.map((exp) => ({
      ...exp.toObject(),
      convertedValue: exp.value * (rates[exp.currency.code] ?? 1),
    }));

    return NextResponse.json({ expenses: convertedExpenses });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}
