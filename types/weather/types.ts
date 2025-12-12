enum WeatherIconType {
    RAIN = 'rain',
    CLEAR = 'clear-day',
    CLOUDY = 'partly-cloudy-day',
}

interface WeatherDisplay {
    date: string;
    icon: WeatherIconType;
    temperature: number;
}