import {WeatherDisplayData} from "@/types/weather/types";
import {WeatherDisplay} from "@/app/components/weather/weatherDisplay";
import {capitalizeFirst} from "@/lib/utils/helperFunctions";

interface WeatherCardProps {
    weatherData: WeatherDisplayData[];
}

export function WeatherCard({ weatherData }: WeatherCardProps) {
    return (
        <div className="mb-4" style={{ borderRadius: "25px" }}>
            <div className="mt-3" style={{ width: "fit-content" }}>
                {weatherData.map((data, i) => (
                    <div key={i}>
                        <p className="mb-1" style={{ fontSize: "0.9rem" }}>
                            <strong>{capitalizeFirst(data.city)}</strong>
                        </p>
                        <hr className="m-0 p-0" />

                        <div className="d-flex text-center px-3 mt-3" style={{ gap: "2.75rem" }}>
                            {data.days.map((day, j) => (
                                <WeatherDisplay
                                    key={j}
                                    dayWeather={day}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
