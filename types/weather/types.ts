export enum WeatherIconType {
    RAIN = 'rain',
    CLEAR = 'clear-day',
    PARTLY_CLOUDY = 'partly-cloudy-day',
    CLOUDY = 'cloudy',
    SNOW = 'snow',
    FOG = 'fog',
    WIND = 'wind',
}

export interface DayWeather {
    date: string;
    icon: WeatherIconType;
    temperature: number;
}

export interface WeatherDisplayData {
    city: string;
    days: DayWeather[];
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

export type WeatherSnapshot = WeatherDisplayData[];
