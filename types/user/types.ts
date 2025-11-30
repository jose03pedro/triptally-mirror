import { Trip } from "../trip/types";

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  icon?: string;
  savedTrips?: Trip[];
}
