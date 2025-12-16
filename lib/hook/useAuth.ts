"use client";

import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { useUserStore } from "@/lib/store/userStore";

type DecodedToken = {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  exp: number;
  iat: number;
};

export function useAuth() {
  // `undefined` = not checked yet, `null` = checked and unauthenticated, object = authenticated
  const [user, setUser] = useState<DecodedToken | null | undefined>(undefined);
  useEffect(() => {
    // Run the token check inside an async loader and await a microtask
    // so we don't call setState synchronously during render/effect setup.
    const load = async () => {
      await Promise.resolve(); // ensure async so setState won't be synchronous here

      const setStoresFromDecoded = (decoded: DecodedToken) => {
        setUser(decoded);
        const existing = useUserStore.getState().user;
        if (!existing) {
          useUserStore.getState().setUser({
            _id: decoded.user.id,
            email: decoded.user.email,
            first_name: decoded.user.first_name,
            last_name: decoded.user.last_name,
          });
        }
      };

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);

          if (decoded.exp * 1000 < Date.now()) {
            console.warn("Token expired");
            localStorage.removeItem("token");
          } else {
            setStoresFromDecoded(decoded);
            return;
          }
        } catch (err) {
          console.error("Invalid token:", err);
          localStorage.removeItem("token");
        }
      }

      // Fallback: cookie-based session (httpOnly) via server endpoint
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = (await res.json()) as {
          user: { id: string; email: string; first_name: string; last_name: string };
        };

        const decoded: DecodedToken = {
          user: data.user,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        };
        setStoresFromDecoded(decoded);
      } catch (err) {
        console.error("Failed to load session:", err);
        setUser(null);
      }
    };

    load();
  }, []);

  return user;
}
