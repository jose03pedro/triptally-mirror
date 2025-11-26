"use client";

import { useEffect, useState, useCallback } from "react";

export function useUnreadNotifications(userId?: string) {
  const [count, setCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }

    try {
      const res = await fetch(
        `/api/users/${userId}/notifications/unread-count`
      );
      const data = await res.json();
      setCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch unread notifications:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchUnread();

    // Optional: auto-refresh every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return { count, refetch: fetchUnread };
}
