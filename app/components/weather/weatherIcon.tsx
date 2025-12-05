import Image from "next/image";

interface WeatherIconProps {
    icon: string,
    size?: number,
}

export function WeatherIcon({ icon, size = 40 }: WeatherIconProps) {
    return (
        <Image src={"/weather/" + icon + ".png"} alt={icon + "weather icon"} width={size} height={size} />
    )
}