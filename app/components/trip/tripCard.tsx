"use client";

import { Trip } from "@/types/trip/types";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TripCardProps {
  loggedUserId?: string;
  trip: Trip;
  userSavedTrips?: string[];
  onRemoved?: (tripId: string) => void;
}

export default function TripCard({
  loggedUserId,
  trip,
  userSavedTrips,
  onRemoved,
}: TripCardProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleUnsaveTrip = async () => {
    if (!saved || saving) return;
    if (!loggedUserId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${loggedUserId}/saved-trips`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip._id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to remove saved trip");
      }

      setSaved(false);
      if (onRemoved) onRemoved(trip._id);
    } catch (err) {
      console.error(err);
      alert("Unable to remove saved trip. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  console.log("loggeduser:", loggedUserId);
  console.log("trip user id:", trip.owner._id);

  return (
    <div className="card h-100 trip-card shadow-sm">
      <div className="trip-thumb rounded-top" />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-2">
          <Link href={`/trips/${trip._id}`}>{trip.title}</Link>
        </h5>

        {loggedUserId !== trip.owner._id && (
          <button
            onClick={saved ? handleUnsaveTrip : handleSaveTrip}
            className={`btn btn-sm mb-2 ${
              saved ? "btn-danger" : "btn-outline-primary"
            }`}
            disabled={saving}
          >
            {saving ? "..." : saved ? "Remove" : "Save"}
          </button>
        )}

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
