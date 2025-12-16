import {WeatherIcon} from "@/app/components/weather/weatherIcon";
import {DayWeather} from "@/types/weather/types";
import {formatShortDate, getWeekday} from "@/lib/utils/helperFunctions";

interface WeatherDisplayProps {
    dayWeather: DayWeather;
}

export function WeatherDisplay({ dayWeather }: WeatherDisplayProps) {
    return (
        <div className="flex-column">
            <p className="small m-0 mb-2">
                <strong>{Math.round(dayWeather.temperature)}°C</strong>
            </p>
            <WeatherIcon
                icon={dayWeather.icon}
            />
            <p className="m-0 mt-2">
                <strong>{getWeekday(dayWeather.date)}</strong>
            </p>
            <p className="mb-0 text-muted" style={{ fontSize: ".65rem" }}>
                {formatShortDate(dayWeather.date)}
            </p>
        </div>
    )
}