import {Trip} from "@/types/trip/types";
import {TripSection} from "@/app/components/trip/tripSection";
import React from "react";
import {WeatherCard} from "@/app/components/weather/weatherCard";

interface WeatherSectionProps {
    trip: Trip;
}
export function WeatherSection({ trip }: WeatherSectionProps) {
    return (
        <TripSection title="Weather">
            <p className="small text-muted m-0">Weather forecast is still not available for this trip.</p>
            <p className="small text-muted m-0">This is the current weather forecast for the trip.</p>
            <WeatherCard />
        </TripSection>
    )
}