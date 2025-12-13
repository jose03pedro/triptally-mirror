import { Currency } from "../currency/types";
import { User } from "../user/types";
import {WeatherDisplayData} from "@/types/weather/types";

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
  lastWeatherSnapshot?: WeatherDisplayData[];
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
