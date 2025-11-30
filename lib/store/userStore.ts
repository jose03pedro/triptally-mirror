import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user/types";

interface UserState {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    updateAvatar: (avatar: string) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
            updateAvatar: (avatar) =>
                set((state) => ({
                    user: state.user ? { ...state.user, avatar } : null,
                })),
        }),
        {
            name: "user-storage", // key in localStorage
        }
    )
);
