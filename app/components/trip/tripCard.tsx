"use client";

import { Trip } from "@/types/trip/types";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TripCardProps {
  loggedUserId?: string;
  trip: Trip;
  userSavedTrips?: string[];
}

export default function TripCard({
  loggedUserId,
  trip,
  userSavedTrips,
}: TripCardProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  console.log(userSavedTrips);

  useEffect(() => {
    if (userSavedTrips?.includes(trip._id)) {
      setSaved(true);
    }
  }, [trip._id, userSavedTrips]);

  const handleSaveTrip = async () => {
    if (saved || saving) return;
    if (!loggedUserId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${loggedUserId}/saved-trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip._id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to save trip");
      }

      setSaved(true);
    } catch (err) {
      console.error(err);
      alert("Unable to save trip. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card h-100 trip-card shadow-sm">
      <div className="trip-thumb rounded-top" />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-2">
          <Link href={`/trips/${trip._id}`}>{trip.title}</Link>
        </h5>

        <button
          onClick={handleSaveTrip}
          className={`btn btn-sm mb-2 ${
            saved ? "btn-success" : "btn-outline-primary"
          }`}
          disabled={saved || saving}
        >
          {saved ? "Saved" : saving ? "Saving..." : "Save"}
        </button>

        <p className="card-text mb-1 text-muted small">
          {trip.cities?.map((c) => `${c.name}, ${c.country}`).join(" · ") ||
            "—"}
        </p>

        <p className="card-text mb-2 text-muted small">
          {new Date(trip.startDate).toLocaleDateString()} –{" "}
          {new Date(trip.endDate).toLocaleDateString()}
        </p>

        <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
          <span className="text-muted small">
            Created by{" "}
            <strong>
              {loggedUserId === trip?.owner._id
                ? "You"
                : `${trip?.owner?.first_name} ${trip?.owner?.last_name}`}
            </strong>
          </span>
          {trip.isPublic && (
            <span className="badge bg-outline-secondary text-muted border">
              Public
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
