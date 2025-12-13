'use client'

import {TripSection} from "@/app/components/trip/tripSection";
import {WeatherCard} from "@/app/components/weather/weatherCard";
import {WeatherDisplayData} from "@/types/weather/types";

interface WeatherSectionProps {
    isPastTrip: boolean;
    weatherDisplay: WeatherDisplayData[];
}

export function WeatherSection({ isPastTrip, weatherDisplay }: WeatherSectionProps) {
    const hasWeather = weatherDisplay?.length > 0;

    return (
        <TripSection title="Weather">
            {hasWeather ? (
                <>
                    <p className="small text-muted m-0">
                        {isPastTrip
                            ? "This is the weather during the trip."
                            : "This is the current weather forecast for the trip."}
                    </p>

                    <WeatherCard weatherData={weatherDisplay} />
                </>
            ) : (
                <p className="small text-muted m-0">
                    {isPastTrip
                        ? "Weather not available for this trip."
                        : "Weather forecast is still not available for this trip."}
                </p>
            )}
        </TripSection>
    )
}