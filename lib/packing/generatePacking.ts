import {
  BASE_ITEMS,
  weatherBasedItems,
  getDurationBasedItems,
  PackingPresetItem,
  WeatherSummary,
} from "./presets";

export interface WeatherDay {
  date: string;
  city: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  precipitationChance: number;
}

export interface GeneratedPackingItem extends PackingPresetItem {
  source: "base" | "weather" | "profile";
}

export function summarizeWeather(days: WeatherDay[]): WeatherSummary {
  if (!days || days.length === 0) {
    return { coldDays: false, hotDays: false, rainyDays: false };
  }

  const coldDays = days.some((d) => d.maxTemp <= 12);
  const hotDays = days.some((d) => d.maxTemp >= 28);
  const rainyDays = days.some(
    (d) =>
      d.precipitationChance >= 0.5 ||
      d.condition.toLowerCase().includes("rain") ||
      d.condition.toLowerCase().includes("shower")
  );

  return { coldDays, hotDays, rainyDays };
}

export function calculateTripDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export function generatePackingItems(
  weatherDays: WeatherDay[],
  startDate?: string,
  endDate?: string
): GeneratedPackingItem[] {
  const summary = summarizeWeather(weatherDays);

  const baseItems: GeneratedPackingItem[] = BASE_ITEMS.map((item) => ({
    ...item,
    source: "base" as const,
  }));

  const weatherItems: GeneratedPackingItem[] = weatherBasedItems(summary).map(
    (item) => ({ ...item, source: "weather" as const })
  );

  let durationItems: GeneratedPackingItem[] = [];
  if (startDate && endDate) {
    const tripDays = calculateTripDays(startDate, endDate);
    durationItems = getDurationBasedItems(tripDays).map((item) => ({
      ...item,
      source: "base" as const,
    }));
  }

  const allItems = [...baseItems, ...weatherItems, ...durationItems];
  const seen = new Set<string>();
  const uniqueItems: GeneratedPackingItem[] = [];

  for (const item of allItems) {
    const key = item.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push(item);
    }
  }

  uniqueItems.sort((a, b) => {
    if (a.required !== b.required) return a.required ? -1 : 1;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  return uniqueItems;
}
