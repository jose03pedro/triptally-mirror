"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/app/components/navigation/navbar";
import { useAuth } from "@/lib/hook/useAuth";
import TripCard from "./components/trip/tripCard";
import { Trip } from "@/types/trip/types";
import TripsGrid from "./components/trip/tripsGrid";
import { Loading } from "./components/ui/loading";

type City = { name: string; country: string };

type TripsResponse = {
  items: Trip[];
  page: number;
  pages: number;
  total: number;
};

export default function Home() {
  const session = useAuth();
  const user = session?.user;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicTrips() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "9",
        });

        const res = await fetch(`/api/trips?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to load trips");

        const data: TripsResponse = await res.json();
        setTrips(data.items || []);
      } catch (err) {
        console.error("Error loading public trips:", err);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicTrips();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          {/* HERO */}
          <section className="flex flex-col items-center text-center gap-4 mb-10 md:mb-14 fade-up">
            <p className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 mb-1">
              TripTally · Plan, share, remember
            </p>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 max-w-3xl">
              Discover trips from the{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
                community
              </span>
            </h1>
            <p className="text-slate-600 max-w-2xl text-sm md:text-base">
              Explore public trips created by other travelers and get inspired
              for your next adventure.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-2"></div>
          </section>

          {/* PUBLIC TRIPS GRID */}
          <section className="space-y-3 fade-up fade-up-delay-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm md:text-base font-semibold text-slate-900">
                Browse trips
              </h2>
            </div>

            {loading && <Loading />}

            {!loading && trips.length === 0 && (
              <p className="text-xs md:text-sm text-slate-500">
                No public trips have been created yet. Be the first to{" "}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  sign up
                </Link>{" "}
                and create one.
              </p>
            )}

            {!loading && trips.length > 0 && <TripsGrid trips={trips} />}
          </section>
        </div>
      </main>
    </>
  );
}
