'use client'

import {TripSection} from "@/app/components/trip/tripSection";
import {WeatherCard} from "@/app/components/weather/weatherCard";
import {WeatherDisplayData} from "@/types/weather/types";

interface WeatherSectionProps {
    weatherDisplay: WeatherDisplayData[];
}

export function WeatherSection({ weatherDisplay }: WeatherSectionProps) {
    return (
        <TripSection title="Weather">
            {weatherDisplay.length > 1
                ? <>
                    <p className="small text-muted m-0">This is the current weather forecast for the trip.</p>
                    <WeatherCard weatherData={weatherDisplay} />
                  </>
                : <p className="small text-muted m-0">Weather forecast is still not available for this trip.</p>}

        </TripSection>
    )
}