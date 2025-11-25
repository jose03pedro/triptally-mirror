"use client";

import TripCard from "@/app/components/trip/tripCard";
import TripsGrid from "@/app/components/trip/tripsGrid";
import { Loading } from "@/app/components/ui/loading";
import { PageHeader } from "@/app/components/ui/pageHeader";
import { NotificationElement } from "@/app/notification/notificationElement";
import { useAuth } from "@/lib/hook/useAuth";
import { Notification } from "@/types/user/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SavedTripsPage() {
  const session = useAuth();
  const user = session?.user;
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (session === null) {
      router.push("/login");
    }
  }, [session, router]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/users/${user.id}/notifications`);
        if (res.ok) {
          const data = await res.json();

          setNotifications(data || []);
        } else {
          console.error("Failed to fetch notifications, status:", res.status);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  const renderNotifications = (notifications: Notification[]) => {
    if (notifications.length === 0) {
      return <div className="text-muted">No notifications to display.</div>;
    }

    return (
      <>
        <div className="row g-3 mb-3">
          {notifications.map((n) => (
            <div key={n._id}>
              <NotificationElement notification={n} />
            </div>
          ))}
        </div>
      </>
    );
  };

  console.log(notifications);

  return (
    <>
      <PageHeader title="Notifications" />
      {loading ? <Loading /> : renderNotifications(notifications)}
    </>
  );
}
