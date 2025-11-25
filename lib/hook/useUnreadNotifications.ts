"use client";

import { useEffect, useState } from "react";

export function useUnreadNotifications(userId?: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const res = await fetch(
          `/api/users/${userId}/notifications/unread-count`
        );
        const data = await res.json();
        setCount(data.unreadCount || 0);
      } catch (err) {
        console.error("Failed to fetch unread notifications:", err);
      }
    };

    fetchCount();

    // Optional: auto-refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return count;
}
