import { NextRequest, NextResponse } from "next/server";

// mais tarde podes mover isto para env
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const city = searchParams.get("city");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!city || !start || !end) {
    return NextResponse.json(
      { error: "city, start and end are required" },
      { status: 400 }
    );
  }

  try {
    // 1) Aqui chamarias a tua API real
    // const response = await fetch(...);
    // const data = await response.json();

    // 2) Por agora, mock simples:
    const days = [
      {
        date: start,
        city,
        minTemp: 18,
        maxTemp: 26,
        condition: "sunny",
        precipitationChance: 0.1,
      },
      {
        date: end,
        city,
        minTemp: 16,
        maxTemp: 22,
        condition: "rain",
        precipitationChance: 0.7,
      },
    ];

    return NextResponse.json({ days }, { status: 200 });
  } catch (err) {
    console.error("Weather error", err);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
