import ExpenseCategory from "@/app/models/ExpenseCategory";
import { NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";

export async function GET(request: Request) {
  try {
    await connectionToDB();

    const expenseCategories = await ExpenseCategory.find();
    return NextResponse.json(expenseCategories);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch expense categories" },
      { status: 500 }
    );
  }
}
