import {Trip} from "@/types/trip/types";
import {TripSection} from "@/app/components/trip/tripSection";
import React, {useEffect, useState} from "react";
import {WeatherCard} from "@/app/components/weather/weatherCard";
import {Loading} from "@/app/components/ui/loading";
import {WeatherDisplayData, WeatherIconType} from "@/types/weather/types";

interface WeatherSectionProps {
    weatherDisplay: WeatherDisplayData[];
}

export function WeatherSection({ weatherDisplay }: WeatherSectionProps) {
    return (
        <TripSection title="Weather">
            <p className="small text-muted m-0">Weather forecast is still not available for this trip.</p>
            <p className="small text-muted m-0">This is the current weather forecast for the trip.</p>
            <WeatherCard weatherData={weatherDisplay} />
        </TripSection>
    )
}