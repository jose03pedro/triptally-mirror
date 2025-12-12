import {WeatherIcon} from "@/app/components/weather/weatherIcon";
import {WeatherDisplayData} from "@/types/weather/types";

interface WeatherDisplayProps {
    weatherData: WeatherDisplayData;
}

export function WeatherDisplay({ weatherData }: WeatherDisplayProps) {
    return (
        <div className="flex-column">
            <p className="small m-0 mb-2">
                <strong>{weatherData.temperature}°C</strong>
            </p>
            <WeatherIcon
                icon={weatherData.icon}
            />
            <p className="m-0 mt-2">
                <strong>Mon</strong>
            </p>
            <p className="mb-0 text-muted" style={{ fontSize: ".65rem" }}>
                2/ago
            </p>
        </div>
    )
}