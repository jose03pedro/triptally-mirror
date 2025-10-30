"use client";

import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import User from "@/app/models/User";

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
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        console.warn("Token expired");
        localStorage.removeItem("token");
        setUser(null);
      } else {
        setUser(decoded);
      }
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  return user;
}
