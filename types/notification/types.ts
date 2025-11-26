import { User } from "../user/types";

export interface NotificationType {
  _id: string;
  name: string;
  icon: string;
}

export interface Notification {
  _id: string;
  user: User;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
