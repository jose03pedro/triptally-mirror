export type PackingItemSource = "base" | "weather" | "profile";

export interface PackingItem {
  _id: string;
  trip: string;
  name: string;
  category: string;
  required: boolean;
  checked: boolean;
  quantity: number;
  source: PackingItemSource;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackingListResponse {
  items: PackingItem[];
}

export interface GeneratePackingResponse {
  message: string;
  itemsAdded: number;
  totalItems: number;
  items?: PackingItem[];
}
