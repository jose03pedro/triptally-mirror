export interface PackingPresetItem {
  name: string;
  category: string;
  required: boolean;
}

export const BASE_ITEMS: PackingPresetItem[] = [
  // Documents
  { name: "Passport / ID", category: "Documents", required: true },
  { name: "Travel insurance documents", category: "Documents", required: true },
  { name: "Wallet / Credit cards", category: "Documents", required: true },
  { name: "Boarding passes / Tickets", category: "Documents", required: false },
  { name: "Hotel reservations", category: "Documents", required: false },

  // Electronics
  { name: "Phone + charger", category: "Electronics", required: true },
  { name: "Power bank", category: "Electronics", required: false },
  { name: "Universal adapter", category: "Electronics", required: false },
  { name: "Headphones", category: "Electronics", required: false },

  // Toiletries
  { name: "Toothbrush & toothpaste", category: "Toiletries", required: true },
  { name: "Deodorant", category: "Toiletries", required: false },
  { name: "Shampoo & conditioner", category: "Toiletries", required: false },
  { name: "Medications", category: "Toiletries", required: false },

  // Clothing basics
  { name: "Underwear", category: "Clothing", required: true },
  { name: "Socks", category: "Clothing", required: true },
  { name: "Comfortable walking shoes", category: "Clothing", required: true },

  // Health & Safety
  { name: "First aid kit", category: "Health", required: false },
  { name: "Hand sanitizer", category: "Health", required: false },
];

export interface WeatherSummary {
  coldDays: boolean;
  rainyDays: boolean;
  hotDays: boolean;
}

export function weatherBasedItems(weatherSummary: WeatherSummary): PackingPresetItem[] {
  const items: PackingPresetItem[] = [];

  if (weatherSummary.coldDays) {
    items.push(
      { name: "Warm jacket", category: "Clothing", required: true },
      { name: "Gloves", category: "Clothing", required: false },
      { name: "Scarf", category: "Clothing", required: false },
      { name: "Warm hat / beanie", category: "Clothing", required: false }
    );
  }

  if (weatherSummary.rainyDays) {
    items.push(
      { name: "Umbrella", category: "Accessories", required: true },
      { name: "Rain jacket / poncho", category: "Clothing", required: false },
      { name: "Waterproof shoes", category: "Clothing", required: false }
    );
  }

  if (weatherSummary.hotDays) {
    items.push(
      { name: "Sunscreen (SPF 30+)", category: "Health", required: true },
      { name: "Sunglasses", category: "Accessories", required: false },
      { name: "Hat / cap", category: "Clothing", required: false },
      { name: "Light breathable clothing", category: "Clothing", required: false }
    );
  }

  return items;
}

export function getDurationBasedItems(tripDays: number): PackingPresetItem[] {
  const items: PackingPresetItem[] = [];

  if (tripDays > 7) {
    items.push(
      { name: "Laundry bag", category: "Accessories", required: false },
      { name: "Travel-size detergent", category: "Toiletries", required: false }
    );
  }

  return items;
}
