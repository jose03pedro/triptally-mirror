"use client";

import { Notification } from "@/types/notification/types";
import { UnreadIndicator } from "./unreadIndicator";
import { RoundIcon } from "../components/ui/roundIcon";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useRef, useEffect } from "react";

interface NotificationElementProps {
  notification: Notification;
}

export function NotificationElement({
  notification,
}: NotificationElementProps) {
  const dayjs = require("dayjs");
  const { markAsRead } = useNotificationStore();
  const ref = useRef<HTMLDivElement>(null);

  const formatNotificationDate = (date: string | Date) => {
    const d = dayjs(date);

    if (d.isSame(dayjs(), "day")) return `Today at ${d.format("HH:mm")}`;
    if (d.isSame(dayjs().subtract(1, "day"), "day"))
      return `Yesterday at ${d.format("HH:mm")}`;
    return d.format("DD MMM YYYY [at] HH:mm");
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark notification as read");
      return await res.json();
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-read after 5s in view
  useEffect(() => {
    if (notification.read) return; // Skip if already read

    let timer: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && !notification.read) {
          // Start 5-second timer
          timer = setTimeout(async () => {
            markAsRead(notification._id);
            await markNotificationAsRead(notification._id);
          }, 5000);
        } else if (!entry.isIntersecting && timer) {
          // Cancel timer if leaves view
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.5 } // 50% visibility
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (timer) clearTimeout(timer);
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [notification, markAsRead]);

  const handleReadNotification = async () => {
    if (!notification.read) {
      markAsRead(notification._id);
      await markNotificationAsRead(notification._id);
    }
  };

  return (
    <div
      ref={ref}
      className="card mb-3 shadow-sm border-0"
      style={{ borderRadius: "12px" }}
      onClick={handleReadNotification}
    >
      <div className="card-body d-flex justify-content-between align-items-start">
        {/* Icon */}
        <div className="me-3">
          <RoundIcon
            url={notification.type.icon}
            size={40}
            description={`${notification.type.name} notification`}
          />
        </div>

        {/* Text */}
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-1">
            <h6 className="fw-semibold mb-0">{notification.title}</h6>

            {/* Unread indicator */}
            {!notification.read && <UnreadIndicator />}
          </div>
          <p className="text-muted mb-1">{notification.message}</p>
          <div className="d-flex align-items-center gap-1">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "15px", color: "#6c757d" }}
            >
              schedule
            </span>
            <small className="text-secondary">
              {formatNotificationDate(notification.createdAt)}
            </small>
          </div>
        </div>
      </div>

      {/* Optional link */}
      {notification.link && (
        <a
          href={notification.link}
          className="card-footer text-decoration-none small text-primary"
        >
          View details →
        </a>
      )}
    </div>
  );
}
