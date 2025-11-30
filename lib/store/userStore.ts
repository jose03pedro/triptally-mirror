"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user/types";

interface UserState {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    updateUser: (user: any) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,

            setUser: (user) => {
                set({ user });
            },

            clearUser: () => {
                set({ user: null });
            },

            updateUser: (partialUser) => {
                 set((state) => ({
                    user: state.user ? { ...state.user, ...partialUser } : null,
                }));
            },
        }),
        {
            name: "user-storage",
        }
    )
);

