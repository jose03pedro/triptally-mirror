export enum WeatherIconType {
    RAIN = 'rain',
    CLEAR = 'clear-day',
    PARTLY_CLOUDY = 'partly-cloudy-day',
    CLOUDY = 'cloudy',
    SNOW = 'snow',
    FOG = 'fog',
}

export interface WeatherDisplayData {
    date: string;
    icon: WeatherIconType;
    temperature: number;
}