"use client";

import { Notification } from "@/types/user/types";
import { UnreadIndicator } from "./unreadIndicator";
import { RoundIcon } from "../components/ui/roundIcon";
import { useNotificationStore } from "@/lib/store/notificationStore";

interface NotificationElementProps {
  notification: Notification;
}

export function NotificationElement({
  notification,
}: NotificationElementProps) {
  const dayjs = require("dayjs");

  const { markAsRead, setNotifications } = useNotificationStore();

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

      if (!res.ok) {
        throw new Error("Failed to mark notification as read");
      }

      return await res.json();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadNotification = async () => {
    const data = await markNotificationAsRead(notification._id);
    if (data.success) {
      markAsRead(notification._id);
    }
  };

  return (
    <div
      className="card mb-3 shadow-sm border-0"
      style={{ borderRadius: "12px" }}
      onClick={handleReadNotification}
    >
      <div className="card-body d-flex justify-content-between align-items-start">
        {/* Icon */}
        <div className="me-3">
          <RoundIcon
            url="/notifications/flight.png"
            size={40}
            description="Flight Notification"
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
