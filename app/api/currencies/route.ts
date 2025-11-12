import {NextResponse} from "next/server";
import connectionToDB from "@/lib/mongoose";
import Currency from "@/app/models/Currency";

export async function GET(request: Request) {
    try {
        await connectionToDB();

        const currencies = await Currency.find();
        return NextResponse.json(currencies);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to fetch currencies" },
            { status: 500 }
        );
    }
}