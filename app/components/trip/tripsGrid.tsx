import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hook/useAuth";
import TripCard from "@/app/components/trip/tripCard";
import { Trip } from "@/types/trip/types";

interface TripsGridProps {
  trips: Trip[];
  onRemovedTrip?: (tripId: string) => void;
}

export default function TripsGrid({ trips, onRemovedTrip }: TripsGridProps) {
  const session = useAuth();
  const userId = session?.user?.id;
  const [savedTripIds, setSavedTripIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchSavedTrips = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/saved-trips`);
        if (!res.ok) throw new Error("Failed to fetch saved trips");

        const data = await res.json();

        // Extract only IDs
        setSavedTripIds(data.map((t: Trip) => t._id));
      } catch (err) {
        console.error(err);
      }
    };

    fetchSavedTrips();
  }, [userId]);

  return (
    <>
      <div className="row g-3 mb-3">
        {trips.map((t : Trip) => (
          <div key={t._id} className="col-12 col-md-6 col-lg-4">
            <TripCard
              loggedUserId={userId}
              trip={t}
              userSavedTrips={savedTripIds}
              onRemoved={onRemovedTrip}
            />
          </div>
        ))}
      </div>
    </>
  );
}
