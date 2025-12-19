export type LocationCategory =
  | "restaurant"
  | "attraction"
  | "museum"
  | "hotel"
  | "shopping"
  | "nightlife"
  | "custom";

export type LocationPriority = 1 | 2 | 3; // 1 = must-see, 2 = want to see, 3 = if time

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MustVisitLocation {
  _id: string;
  name: string;
  category: LocationCategory;
  address?: string;
  coordinates?: Coordinates;
  placeId?: string; // Google Places ID
  notes?: string;
  priority: LocationPriority;
  addedAt: string;
}

export interface PlacePrediction {
  placeId: string;
  name: string;
  address: string;
  types: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  coordinates?: Coordinates;
  types: string[];
  rating?: number;
  openingHours?: string[];
  website?: string;
  phoneNumber?: string;
}

export const PRIORITY_LABELS: Record<LocationPriority, string> = {
  1: "Must See",
  2: "Want to See",
  3: "If Time Permits",
};

export const CATEGORY_LABELS: Record<LocationCategory, string> = {
  restaurant: "Restaurant",
  attraction: "Attraction",
  museum: "Museum",
  hotel: "Hotel",
  shopping: "Shopping",
  nightlife: "Nightlife",
  custom: "Custom",
};

export const CATEGORY_ICONS: Record<LocationCategory, string> = {
  restaurant: "restaurant",
  attraction: "attractions",
  museum: "museum",
  hotel: "hotel",
  shopping: "shopping_bag",
  nightlife: "nightlife",
  custom: "place",
};
