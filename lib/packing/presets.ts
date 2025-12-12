export const BASE_ITEMS = [
  { name: "Passport / ID", category: "Documents", required: true },
  { name: "Wallet", category: "Documents", required: true },
  { name: "Phone + charger", category: "Electronics", required: true },
  { name: "Toothbrush", category: "Toiletries", required: false },
  // ...
];

export function weatherBasedItems(weatherSummary: {
  coldDays: boolean;
  rainyDays: boolean;
  hotDays: boolean;
}) {
  const items = [];

  if (weatherSummary.coldDays) {
    items.push(
      { name: "Warm jacket", category: "Clothing", required: false },
      { name: "Gloves", category: "Clothing", required: false }
    );
  }

  if (weatherSummary.rainyDays) {
    items.push(
      { name: "Umbrella", category: "Clothing", required: false },
      { name: "Waterproof shoes", category: "Clothing", required: false }
    );
  }

  if (weatherSummary.hotDays) {
    items.push(
      { name: "Sunscreen", category: "Health", required: false },
      { name: "Hat", category: "Clothing", required: false }
    );
  }

  return items;
}
