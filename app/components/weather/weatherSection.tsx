import {Trip} from "@/types/trip/types";
import {TripSection} from "@/app/components/trip/tripSection";
import React, {useEffect, useState} from "react";
import {WeatherCard} from "@/app/components/weather/weatherCard";
import {Loading} from "@/app/components/ui/loading";

interface DayForecast {
    datetime: string;
    tempmax: number;
    tempmin: number;
    temp: number;
    conditions: string;
    icon: string;
}

interface WeatherResponse {
    latitude: number;
    longitude: number;
    resolvedAddress: string;
    address: string;
    days: DayForecast[];
}

interface WeatherSectionProps {
    trip: Trip;
}

export function WeatherSection({ trip }: WeatherSectionProps) {
    const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [weatherDisplay, setWeatherDisplay] = useState<WeatherDisplay[]>([]);

    const parseWeatherRes = (data: WeatherResponse | null) => {
        if (!data) return;
        const days : DayForecast[] = data.days;

        const formatted: WeatherDisplay[] = days.map(item => ({
            date: item.datetime,
            icon: item.icon as WeatherIconType,
            temperature: item.temp,
        }));

        setWeatherDisplay(formatted);
    };

    useEffect(() => {
        (async () => {
            try {
                // Get weather for current trip
                const res = await fetch(`/api/weather?location="lisbon"`);
                if (!res.ok) console.error(res.text);

                const data = await res.json();
                setWeatherData(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (weatherData) {
            parseWeatherRes(weatherData);
        }
    }, [weatherData]);

    if (isLoading) { return <Loading />; }

    return (
        <TripSection title="Weather">
            <p className="small text-muted m-0">Weather forecast is still not available for this trip.</p>
            <p className="small text-muted m-0">This is the current weather forecast for the trip.</p>
            <WeatherCard weatherData={weatherDisplay} />
        </TripSection>
    )
}