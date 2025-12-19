"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loading } from "@/app/components/ui/loading";
import { TripOverview } from "@/app/components/trip/tripOverview";
import { Trip } from "@/types/trip/types";

export default function PublicTripPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchTrip = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/trips/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Trip not found");
          } else if (response.status === 403) {
            setError("This trip is not publicly shared");
          } else {
            setError("Failed to load trip");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setTrip(data);
      } catch (err) {
        console.error("Error fetching public trip:", err);
        setError("Failed to load trip");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
        <div className="mx-auto max-w-6xl">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              {error || "Trip not found"}
            </h1>
            <p className="text-slate-600 mb-6">
              {error || "The trip you're looking for doesn't exist or is no longer available."}
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const privacy = trip.privacy || {};
  const showCities = privacy.showCities !== false;
  const showCover = privacy.showCover !== false;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <header className="space-y-3">
          {showCover && trip.coverImage && (
            <div
              className="position-relative mb-4"
              style={{
                left: "50%",
                right: "50%",
                marginLeft: "-50vw",
                marginRight: "-50vw",
                width: "100vw",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={trip.coverImage}
                alt={trip.title}
                className="w-100 object-fit-cover"
                style={{ height: "23rem" }}
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                {trip.title}
              </h1>
              {trip.owner && (
                <p className="text-sm text-slate-600">
                  Shared by {trip.owner.first_name} {trip.owner.last_name}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* OVERVIEW */}
        <TripOverview trip={trip} showCities={showCities} />

        {/* Note about privacy */}
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
          <p className="text-sm text-blue-800">
            This is a publicly shared trip. Some details may be hidden based on privacy settings.
          </p>
        </div>
      </div>
    </div>
  );
}

