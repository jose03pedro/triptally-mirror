import { NextResponse } from "next/server";
import {getTripsForNextDays, isDateWithinTrip, mergeDaysByDate, updateTripSnapshot} from "@/lib/db/trips";
import {getWeather} from "@/app/api/weather/route";
import {DayWeather, WeatherDisplayData} from "@/types/weather/types";
import {WeatherSnapshot} from "@/types/trip/types";

export async function GET() {
    const trips = await getTripsForNextDays(14);

    for (const trip of trips) {
        const weather: WeatherDisplayData[] = await getWeather(trip.cities);

        const prevSnapshot: WeatherSnapshot = trip.lastWeatherSnapshot ?? {};
        const newSnapshot: WeatherSnapshot = {};

        for (const { city, days } of weather) {
            // Only forecast days within trip
            const forecastTripDays = days.filter(day =>
                isDateWithinTrip(day.date, trip.startDate, trip.endDate)
            );

            const prevDays = prevSnapshot[city] ?? [];

            // Merge instead of replace
            const mergedDays = mergeDaysByDate(prevDays as DayWeather[], forecastTripDays);

            if (mergedDays.length === 0) continue;

            // Compare today (only if both exist)
            const today = mergedDays.find(d =>
                isDateWithinTrip(d.date, new Date().toISOString(), new Date().toISOString())
            );

            const prevToday = prevDays.find(d => d.date === today?.date);

            if (today && prevToday) {
                const tempDiff = Math.abs(today.temperature - prevToday.temperature);
                const conditionChanged = today.icon !== prevToday.icon;

                if (tempDiff >= 3 || conditionChanged) {
                    console.log(`Weather changed for ${city} in trip ${trip._id}`);
                }
            }

            newSnapshot[city] = mergedDays;
        }

        await updateTripSnapshot(trip._id, newSnapshot);
    }

    return NextResponse.json({ ok: true });
}
