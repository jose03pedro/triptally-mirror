import Image from "next/image";
import {WeatherIconType} from "@/types/weather/types";

interface WeatherIconProps {
    icon: string,
    size?: number,
}

export function WeatherIcon({ icon, size = 35 }: WeatherIconProps) {
    const getIconPath = (icon: string) => {
        switch (icon) {
            case WeatherIconType.RAIN: return "rain.png"
            case WeatherIconType.CLEAR: return "clear.png"
            case WeatherIconType.PARTLY_CLOUDY: return "partlycloudy.png"
            case WeatherIconType.CLOUDY: return "cloudy.png"
            case WeatherIconType.SNOW: return "snow.png"
            case WeatherIconType.FOG: return "fog.png"
            case WeatherIconType.WIND: return "wind.png"
        }
    }
    console.log(icon)
    const iconPath = getIconPath(icon);

    if (!iconPath) return;

    return (
        <Image src={"/weather/" + iconPath} alt={icon + "weather icon"} width={size} height={size} />
    )
}