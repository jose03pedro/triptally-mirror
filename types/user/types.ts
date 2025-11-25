import { Trip } from "../trip/types";

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  savedTrips?: Trip[];
}

export interface Notification {
  _id: string;
  user: User;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
