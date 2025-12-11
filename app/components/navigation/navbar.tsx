"use client";

import { useAuth } from "@/lib/hook/useAuth";
import Link from "next/link";
import { NavDropdown } from "@/app/components/navigation/nav-dropdown";
import { NavbarButton } from "./navbarButton";
import { UnreadIndicator } from "@/app/notification/unreadIndicator";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useEffect } from "react";
import {useUserStore} from "@/lib/store/userStore";
import {Logo} from "@/app/components/navigation/logo";

export function Navbar() {
  const session = useAuth();
  const { user, updateUser } = useUserStore();

  const notifications = useNotificationStore((state) => state.notifications);
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications
  );

  useEffect(() => {
    if (!user?._id) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/users/${user._id}/notifications`);
        if (!res.ok) throw new Error("Failed to fetch notifications");

        const data = await res.json();
        setNotifications(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, [user?._id, setNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="navbar navbar-expand-sm navbar-light bg-white border-bottom fixed-top">
      <div className="container-fluid px-4">
        <Logo />

        <div className="d-flex align-items-center">
          {/* Saved trips navigation */}
          {user && (
            <NavbarButton
              navigateTo="/profile/saved-trips"
              tooltip="Your saved trips"
              icon="bookmark"
            />
          )}

          {/* Notifications navigation */}
          {user && (
            <div style={{ position: "relative", display: "inline-block" }}>
              <NavbarButton
                navigateTo="/profile/notifications"
                tooltip="Your notifications"
                icon="notifications"
              />
              {unreadCount > 0 && (
                <UnreadIndicator
                  style={{ position: "absolute", top: "-2px", right: "0" }}
                />
              )}
            </div>
          )}

          {session === undefined ? (
            <div className="d-flex align-items-center gap-2">
              <span
                className="placeholder col-4 me-2"
                style={{ height: 28, display: "inline-block" }}
              />
              <span
                className="placeholder col-6 d-none d-md-inline-block"
                style={{ height: 36, display: "inline-block" }}
              />
            </div>
          ) : !user ? (
            <>
              <Link href="/login" className="btn btn-link me-2">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Get started
              </Link>
            </>
          ) : (
            <NavDropdown
              firstName={user.first_name}
              lastName={user.last_name}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
