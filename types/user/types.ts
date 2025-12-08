import { Trip } from "../trip/types";

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar?: string;
  savedTrips?: Trip[];
}
