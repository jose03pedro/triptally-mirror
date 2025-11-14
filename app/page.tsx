"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/app/components/navigation/navbar";
import { useAuth } from "@/lib/hook/useAuth";

type City = { name: string; country: string };

type Trip = {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  cities: City[];
  createdByName?: string;
};

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchPublicTrips() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "6",
        });

        const res = await fetch(`/api/trips?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to load trips");

        const data: TripsResponse = await res.json();
        if (!ignore) setTrips(data.items || []);
      } catch (err) {
        console.error("Error loading public trips:", err);
        if (!ignore) setTrips([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchPublicTrips();
    return () => {
      ignore = true;
    };
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
              Explore public trips created by other travelers and get inspired for your next adventure.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-2">
              
            </div>
          </section>

          {/* PUBLIC TRIPS GRID */}
          <section className="space-y-3 fade-up fade-up-delay-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm md:text-base font-semibold text-slate-900">
                Public trips
              </h2>
              <span className="text-xs text-slate-500">
                {trips.length > 0 ? `${trips.length} trips loaded` : "No public trips yet"}
              </span>
            </div>

            {loading && (
              <p className="text-xs text-slate-500">Loading trips...</p>
            )}

            {!loading && trips.length === 0 && (
              <p className="text-xs md:text-sm text-slate-500">
                No public trips have been created yet. Be the first to{" "}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  sign up
                </Link>{" "}
                and create one.
              </p>
            )}

            {!loading && trips.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trips.map((t, idx) => (
                  <article
                    key={t._id}
                    className={`group rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 fade-up fade-up-delay-${idx +
                      2}`}
                  >
                    <div className="p-4 flex flex-col h-full">
                      <h3 className="text-sm font-semibold text-slate-900 mb-1">
                        <Link
                          href={`/trips/${t._id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {t.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-500 mb-1">
                        {t.cities
                          ?.map((c) => `${c.name}, ${c.country}`)
                          .join(" · ") || "—"}
                      </p>
                      <p className="text-xs text-slate-500 mb-2">
                        {new Date(t.startDate).toLocaleDateString()} –{" "}
                        {new Date(t.endDate).toLocaleDateString()}
                      </p>
                      <p className="mt-auto text-[11px] text-slate-400">
                        by{" "}
                        <span className="font-medium text-slate-600">
                          {t.createdByName || "Unknown traveler"}
                        </span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
