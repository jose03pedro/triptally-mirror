'use server'

import connectionToDB from "@/lib/mongoose";
import {NextResponse} from "next/server";
import Expense from "@/app/models/Expense";
import ExpenseCategory from "@/app/models/ExpenseCategory";
import Currency from "@/app/models/Currency";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
    ) {
    try {
        await connectionToDB();
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {error: "Trip ID is required"},
                {status: 400}
            );
        }

        const expenses = await Expense
            .find({ trip: id })
            .populate({path: "category", model: "ExpenseCategory"})
            .populate("currency");

        return NextResponse.json(
            expenses,
            {status: 200}
        )
        
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "Failed to fetch expenses" },
            { status: 500 }
        );
    }
}