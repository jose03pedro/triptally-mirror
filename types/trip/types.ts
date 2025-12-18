import { Currency } from "../currency/types";
import { User } from "../user/types";
import {WeatherDisplayData, WeatherIconType} from "@/types/weather/types";
import { MustVisitLocation } from "@/types/location/types";

export interface City {
  name: string;
  country: string;
}

export interface Trip {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  cities?: City[];
  isPublic?: boolean;
  coverImage?: string;
  owner: User;
  currency?: Currency;
  lastWeatherSnapshot?: WeatherSnapshot;
  mustVisitLocations?: MustVisitLocation[];
  privacy?: {
    showCities?: boolean;
    showExpenses?: boolean;
    showItinerary?: boolean;
    showCover?: boolean;
  };
}

export type TripsResponse = {
  items: Trip[];
  page: number;
  pages: number;
  total: number;
};

export type WeatherSnapshot = Record<
    string, // city
    {
        date: string;
        temperature: number;
        icon: WeatherIconType;
    }[]
>;
