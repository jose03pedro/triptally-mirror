'use client'

import { TripSection } from "@/app/components/trip/tripSection";
import { WeatherCard } from "@/app/components/weather/weatherCard";
import { WeatherDisplayData } from "@/types/weather/types";
import { WeatherSnapshot } from "@/types/trip/types";

/* ---------------- Types ---------------- */

type DayWeather = WeatherDisplayData["days"][number];

/* ---------------- Helpers ---------------- */

// Convert stored snapshot → WeatherDisplayData[]
function snapshotToWeatherDisplay(
    snapshot?: WeatherSnapshot
): WeatherDisplayData[] {
    if (!snapshot) return [];

    return Object.values(snapshot).flatMap(cityObject =>
        Object.entries(cityObject).map(([city, days]) => ({
            city,
            days: Array.isArray(days) ? days : [days],
        }))
    );
}

// Merge snapshot (past) + live forecast (today/future)
function mergeWeatherDisplay(
    snapshot: WeatherDisplayData[],
    live: WeatherDisplayData[]
): WeatherDisplayData[] {
    const cityMap = new Map<string, WeatherDisplayData>();

    // Start with stored snapshot
    for (const item of snapshot) {
        cityMap.set(item.city, {
            city: item.city,
            days: Array.isArray(item.days) ? [...item.days] : [],
        });
    }

    // Merge / override with live forecast
    for (const item of live) {
        const existing = cityMap.get(item.city);

        if (!existing) {
            cityMap.set(item.city, item);
        } else {
            const daysByDate = new Map<string, DayWeather>(
                existing.days.map(d => [d.date, d])
            );

            for (const day of item.days) {
                daysByDate.set(day.date, day);
            }

            existing.days = Array.from(daysByDate.values()).sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            );
        }
    }

    return Array.from(cityMap.values());
}

/* ---------------- Component ---------------- */

interface WeatherSectionProps {
    isPastTrip: boolean;
    weatherSnapshot: WeatherSnapshot;
    weatherDisplay: WeatherDisplayData[];
}

export function WeatherSection({isPastTrip, weatherSnapshot, weatherDisplay}: WeatherSectionProps) {
    // Normalize stored snapshot
    const storedWeatherDisplay = snapshotToWeatherDisplay(weatherSnapshot);

    console.log(storedWeatherDisplay);

    // Merge stored + live
    const unifiedWeatherDisplay = mergeWeatherDisplay(
        storedWeatherDisplay,
        weatherDisplay
    );

    const hasWeather = unifiedWeatherDisplay.length > 0;

    return (
        <TripSection title="Weather">
            {hasWeather ? (
                <>
                    <p className="small text-muted m-0">
                        {isPastTrip
                            ? "This was the weather during the trip."
                            : "This is the weather forecast for the trip."}
                    </p>

                    <WeatherCard weatherData={unifiedWeatherDisplay} />
                </>
            ) : (
                <p className="small text-muted m-0">
                    {isPastTrip
                        ? "Weather not available for this trip."
                        : "Weather forecast is not available yet."}
                </p>
            )}
        </TripSection>
    );
}
