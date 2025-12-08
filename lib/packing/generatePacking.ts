import { BASE_ITEMS, weatherBasedItems } from "./presets";

interface WeatherDay {
  minTemp: number;
  maxTemp: number;
  condition: string;
  precipitationChance: number;
}

export function summarizeWeather(days: WeatherDay[]) {
  const coldDays = days.some((d) => d.maxTemp <= 12);
  const hotDays = days.some((d) => d.maxTemp >= 28);
  const rainyDays = days.some((d) => d.precipitationChance >= 0.5 || d.condition === "rain");

  return { coldDays, hotDays, rainyDays };
}

export function generatePackingItems(weatherDays: WeatherDay[]) {
  const summary = summarizeWeather(weatherDays);

  const base = BASE_ITEMS.map((i) => ({ ...i, source: "base" as const }));
  const weather = weatherBasedItems(summary).map((i) => ({
    ...i,
    source: "weather" as const,
  }));

  // aqui podes mais tarde misturar com preferências do traveler profile
  return [...base, ...weather];
}
