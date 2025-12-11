"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/app/components/navigation/navbar";
import { useAuth } from "@/lib/hook/useAuth";
import TripsGrid from "./components/trip/tripsGrid";
import { Trip } from "@/types/trip/types";
import { Loading } from "./components/ui/loading";

type TripsResponse = {
  items: Trip[];
  page: number;
  pages: number;
  total: number;
};

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingNext, setIsFetchingNext] = useState(false);

  async function fetchPublicTrips(pageToLoad: number) {
    try {
      if (pageToLoad === 1) setLoading(true);
      else setIsFetchingNext(true);

      const params = new URLSearchParams({
        page: pageToLoad.toString(),
        limit: "9",
      });

      const res = await fetch(`/api/trips?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to load trips");

      const data: TripsResponse = await res.json();

      if (pageToLoad === 1) {
        setTrips(data.items);
      } else {
        setTrips((prev) => {
          const existingIds = new Set(prev.map((t) => t._id));
          const newTrips = data.items.filter((t) => !existingIds.has(t._id));
          return [...prev, ...newTrips];
        });
      }

      // No more pages
      if (data.items.length < 9) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading public trips:", err);
      if (pageToLoad === 1) setTrips([]);
    } finally {
      if (pageToLoad === 1) setLoading(false);
      else setIsFetchingNext(false);
    }
  }


  useEffect(() => {
    fetchPublicTrips(1);
  }, []);

  // Infinite scroll trigger
  useEffect(() => {
    if (!hasMore) return;

    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

      if (nearBottom && !isFetchingNext) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isFetchingNext]);

  // Fetch next pages
  useEffect(() => {
    if (page > 1) fetchPublicTrips(page);
  }, [page]);

  return (
    <>
        <div className="mx-auto max-w-6xl px-4">
          {/* HERO */}
          <section className="d-flex flex-column align-items-center text-center gap-3 my-5 mb-md-6">
              <p className="d-inline-flex align-items-center rounded-pill bg-primary bg-opacity-10 px-3 py-1 small fw-medium text-primary mb-1">
                  TripTally · Plan, share, remember
              </p>

              <h1 className="fs-1 fs-md-2 fw-semibold lh-sm text-dark max-w-75">
                  Discover trips from the{" "}
                  <span className="text-gradient">
                    community
                  </span>
              </h1>

              <p className="text-muted fs-6 fs-md-5 mx-auto" >
                  Explore public trips created by other travelers and get inspired for your next adventure.
              </p>
          </section>

            {/* PUBLIC TRIPS GRID */}
          <section className="space-y-3 fade-up fade-up-delay-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm md:text-base font-semibold text-slate-900">
                Browse trips
              </h2>
            </div>

            {loading ? <Loading /> : ""}

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

            {/* Loading indicator for next pages */}
            {isFetchingNext && (
              <div className="flex justify-center py-4">
                <Loading />
              </div>
            )}
          </section>
        </div>
    </>
  );
}
