import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = process.env.WEATHER_API_KEY;

  const location = searchParams.get("location");
  if (!location) {
      console.error("Location not found.");
      return NextResponse.json(
          { message: "Location not found." },
          { status: 400 }
      );
  }

  try {
      const res = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/lisbon?unitGroup=metric&include=days&key=${apiKey}&contentType=json`
      );

      if (!res.ok) {
          console.error(res);
          return NextResponse.json(
              { message: "Failed to fetch weather forecast" },
              { status: res.status }
          );
      }
      const data = await res.json();

      return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Weather error", err);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
