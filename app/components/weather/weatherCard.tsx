import {WeatherDisplay} from "@/app/components/weather/weatherDisplay";

export function WeatherCard() {
    return (
        <div className="mb-4" style={{ borderRadius: "25px" }}>
            <div className="mt-3" style={{ width: "fit-content" }} >
                <p className="mb-1" style={{ fontSize: "0.9rem"}}><strong>Tokyo</strong></p>
                <hr className="m-0 p-0" />
                <div className="d-flex gap-5 text-center px-4 mt-3">
                    <WeatherDisplay/>
                    <WeatherDisplay/>
                </div>
            </div>
        </div>
    )
}