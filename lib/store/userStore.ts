"use client";

import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import {User} from "@/types/user/types";

interface UserState {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    updateUser: (user: Partial<User>) => void;
}

interface PersistedUserState extends UserState {
    _timestamp: number | null;
}

const ONE_DAY = 24 * 60 * 60 * 1000;

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,

            setUser: (user) => {
                set({
                    user,
                    _timestamp: Date.now(),
                } as Partial<PersistedUserState>);
            },

            clearUser: () => {
                set({ user: null });
            },

            updateUser: (partialUser) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...partialUser } : null,
                    _timestamp: Date.now(),
                } as Partial<PersistedUserState>));
            },
        }),

        {
            name: "user-storage",

            merge: (
                persistedState: unknown,
                currentState: UserState
            ): PersistedUserState => {
                const state = persistedState as PersistedUserState;

                const isExpired =
                    state?._timestamp &&
                    Date.now() - state._timestamp > ONE_DAY;

                if (isExpired) {
                    return {
                        ...currentState,
                        user: null,
                        _timestamp: null,
                    };
                }

                // Merge the persisted state with the current one
                return {
                    ...currentState,
                    ...state,
                };
            },
        } as PersistOptions<UserState, PersistedUserState>
    )
);


