import { User } from "../user/types";

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
  owner: User;
}

export type TripsResponse = {
  items: Trip[];
  page: number;
  pages: number;
  total: number;
};
