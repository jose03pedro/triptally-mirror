// app/api/exchange-rates/route.ts
import { NextResponse } from "next/server";

const apiKey = process.env.FREE_CURRENCY_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const toCurrency = searchParams.get("toCurrency") || "";
  const fromCurrency = searchParams.get("fromCurrency") || "";

  const res = await fetch(
    `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=${toCurrency}&base_currency=${fromCurrency}`
  );
  const data = await res.json();

  return NextResponse.json(data);
}
