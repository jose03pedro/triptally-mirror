import { create } from "zustand";
import { Notification } from "@/types/notification/types";
import {User} from "@/types/user/types";

interface NotificationState {
  notifications: Notification[];
  setNotifications: (n: Notification[]) => void;
  markAsRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  setNotifications: (n) => set({ notifications: n }),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif._id === id ? { ...notif, read: true } : notif
      ),
    })),
}));
