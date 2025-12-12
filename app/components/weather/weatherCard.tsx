import {WeatherDisplayData} from "@/types/weather/types";
import {WeatherDisplay} from "@/app/components/weather/weatherDisplay";

interface WeatherCardProps {
    weatherData: WeatherDisplayData[];
}

export function WeatherCard({ weatherData }: WeatherCardProps) {
    return (
        <div className="mb-4" style={{ borderRadius: "25px" }}>
            <div className="mt-3" style={{ width: "fit-content" }}>
                <p className="mb-1" style={{ fontSize: "0.9rem" }}>
                    <strong>Tokyo</strong>
                </p>
                <hr className="m-0 p-0" />

                <div className="d-flex text-center px-3 mt-3" style={{ gap: "2.75rem" }}>
                    {weatherData.map((item, index) => (
                        <WeatherDisplay
                            key={index}
                            weatherData={item}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
