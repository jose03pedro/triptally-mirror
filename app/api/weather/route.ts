import {NextRequest, NextResponse} from "next/server";
import {City} from "@/types/trip/types";
import {DayForecast, DayWeather, WeatherDisplayData, WeatherIconType} from "@/types/weather/types";
import connectionToDB from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
      console.error("API key not found.");
      return NextResponse.json(
          { message: "API key not found." },
          { status: 400 }
      );
  }

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
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&include=days&key=${apiKey}&contentType=json`
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

export async function getWeather(cities: City[] | undefined): Promise<WeatherDisplayData[]> {
    await connectionToDB();

    if (!cities || !cities.length) return [];

    const key = process.env.WEATHER_API_KEY;
    if (!key) throw new Error("Missing WEATHER_API_KEY");

    const weatherResults: WeatherDisplayData[] = [];

    try {
        for (const city of cities) {
            const location = encodeURIComponent(city.name);

            const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&include=days&key=${key}&contentType=json`;
            const res = await fetch(url);

            if (!res.ok) {
                console.error(`Weather request failed for ${city.name}:`, res.status);
                continue;
            }

            const data = await res.json();

            // Build the data structure for this city
            const days: DayWeather[] = data.days.map((d: DayForecast) => ({
                date: d.datetime,
                icon: d.icon as WeatherIconType,
                temperature: d.temp,
            }));

            weatherResults.push({
                city: city.name,
                days
            });
        }

        return weatherResults;
    } catch (err) {
        console.error("Weather error", err);
        throw new Error("Failed to fetch weather");
    }
}
