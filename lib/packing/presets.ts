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

// US318: Profile-based packing recommendations
export interface TravelerProfileData {
  travelFrequency?: string;
  preferredTransport?: string[];
  accommodationType?: string;
  budgetRange?: string;
  dietaryRestrictions?: string[];
  mobilityNeeds?: string;
  interests?: string[];
  languagesSpoken?: string[];
  tripStyle?: string;
}

export function profileBasedItems(profile: TravelerProfileData): PackingPresetItem[] {
  const items: PackingPresetItem[] = [];

  // Based on interests
  if (profile.interests) {
    if (profile.interests.includes("hiking") || profile.interests.includes("outdoor")) {
      items.push(
        { name: "Hiking boots", category: "Clothing", required: true },
        { name: "Backpack (daypack)", category: "Accessories", required: false },
        { name: "Water bottle", category: "Accessories", required: true },
        { name: "Trail snacks", category: "Food", required: false }
      );
    }

    if (profile.interests.includes("photography")) {
      items.push(
        { name: "Camera", category: "Electronics", required: false },
        { name: "Extra memory cards", category: "Electronics", required: false },
        { name: "Camera charger", category: "Electronics", required: false }
      );
    }

    if (profile.interests.includes("beach") || profile.interests.includes("swimming")) {
      items.push(
        { name: "Swimsuit", category: "Clothing", required: true },
        { name: "Beach towel", category: "Accessories", required: false },
        { name: "Flip flops", category: "Clothing", required: false }
      );
    }

    if (profile.interests.includes("business")) {
      items.push(
        { name: "Business attire", category: "Clothing", required: true },
        { name: "Laptop", category: "Electronics", required: true },
        { name: "Dress shoes", category: "Clothing", required: false }
      );
    }

    if (profile.interests.includes("fitness") || profile.interests.includes("gym")) {
      items.push(
        { name: "Workout clothes", category: "Clothing", required: false },
        { name: "Running shoes", category: "Clothing", required: false },
        { name: "Resistance bands", category: "Accessories", required: false }
      );
    }
  }

  // Based on dietary restrictions
  if (profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0) {
    items.push(
      { name: "Dietary restriction card (translated)", category: "Documents", required: true },
      { name: "Snacks (dietary-compliant)", category: "Food", required: false }
    );
  }

  // Based on mobility needs
  if (profile.mobilityNeeds && profile.mobilityNeeds !== "none" && profile.mobilityNeeds !== "") {
    items.push(
      { name: "Mobility aids", category: "Health", required: true },
      { name: "Comfortable supportive shoes", category: "Clothing", required: true }
    );
  }

  // Based on trip style
  if (profile.tripStyle) {
    if (profile.tripStyle === "luxury") {
      items.push(
        { name: "Formal wear", category: "Clothing", required: false },
        { name: "Jewelry/accessories", category: "Accessories", required: false }
      );
    }

    if (profile.tripStyle === "backpacking" || profile.tripStyle === "budget") {
      items.push(
        { name: "Padlock for hostels", category: "Accessories", required: true },
        { name: "Quick-dry towel", category: "Toiletries", required: false },
        { name: "Sleeping bag liner", category: "Accessories", required: false }
      );
    }

    if (profile.tripStyle === "adventure") {
      items.push(
        { name: "Multi-tool", category: "Accessories", required: false },
        { name: "Headlamp", category: "Electronics", required: false },
        { name: "Dry bag", category: "Accessories", required: false }
      );
    }
  }

  // Based on preferred transport
  if (profile.preferredTransport) {
    if (profile.preferredTransport.includes("plane") || profile.preferredTransport.includes("flight")) {
      items.push(
        { name: "Neck pillow", category: "Accessories", required: false },
        { name: "Eye mask", category: "Accessories", required: false },
        { name: "Compression socks", category: "Clothing", required: false }
      );
    }

    if (profile.preferredTransport.includes("car") || profile.preferredTransport.includes("road")) {
      items.push(
        { name: "Driving snacks", category: "Food", required: false },
        { name: "Car phone mount", category: "Electronics", required: false }
      );
    }
  }

  return items;
}
