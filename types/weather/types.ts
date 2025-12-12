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

export interface DayForecast {
    datetime: string;
    tempmax: number;
    tempmin: number;
    temp: number;
    conditions: string;
    icon: string;
}

export interface WeatherResponse {
    latitude: number;
    longitude: number;
    resolvedAddress: string;
    address: string;
    days: DayForecast[];
}