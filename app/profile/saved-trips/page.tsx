"use client";

import TripCard from "@/app/components/trip/tripCard";
import { Loading } from "@/app/components/ui/loading";
import { useAuth } from "@/lib/hook/useAuth";
import { Trip } from "@/types/trip/types";
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

  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedTrips = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/users/${user.id}/saved-trips`);
        if (res.ok) {
          const data = await res.json();
          setSavedTrips(data || []);
        } else {
          console.error("Failed to fetch saved trips, status:", res.status);
        }
      } catch (err) {
        console.error("Failed to fetch saved trips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedTrips();
  }, [user]);

  // Helper to render cards for a list of trips
  const renderTripGrid = (trips: Trip[]) => {
    if (trips.length === 0) {
      return <div className="text-muted">You haven't saved any trips yet.</div>;
    }

    return (
      <div className="row g-3 mb-3">
        {trips.map((t) => (
          <div key={t._id} className="col-12 col-md-6 col-lg-4">
            <TripCard loggedUserId={user?.id} trip={t} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Saved Trips</h1>
      {loading ? <Loading /> : renderTripGrid(savedTrips)}
    </div>
  );
}
