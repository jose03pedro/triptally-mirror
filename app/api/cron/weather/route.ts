import { NextResponse } from "next/server";
import {getTripsForNextDays, updateTripSnapshot} from "@/lib/db/trips";
import {getWeather} from "@/app/api/weather/route";
import {WeatherDisplayData} from "@/types/weather/types";

export async function GET() {
    const trips = await getTripsForNextDays(14);

    for (const trip of trips) {
        const weather : WeatherDisplayData[] = await getWeather(trip.cities);

        const prevSnapshot = trip.lastWeatherSnapshot || {};

        const newSnapshot: Record<string, any> = {};

        for (const cityData of weather) {
            const { city, days } = cityData;
            const today = days[0]; // compare only today / first day

            const prev = prevSnapshot[city];

            if (prev) {
                const tempDiff = Math.abs(today.temperature - prev.temperature);
                const conditionChanged = today.icon !== prev.icon;

                if (tempDiff >= 3 || conditionChanged) {
                    console.log(`Weather changed for ${city} in trip ${trip._id}`);
                }
            }

            // save today's snapshot for this city
            newSnapshot[city] = today;
        }

        await updateTripSnapshot(trip._id, newSnapshot);
    }

    return NextResponse.json({ ok: true });
}
