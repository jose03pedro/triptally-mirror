"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hook/useAuth";
import { Loading } from "@/app/components/ui/loading";
import { Expense } from "@/app/expenses/expense";

type City = { name: string; country?: string };

type TripUser = {
  _id: string;
  first_name?: string;
  last_name?: string;
};

type Trip = {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  cities: City[];
  isPublic?: boolean;
  coverImage?: string;
  privacy?: {
    showCities?: boolean;
    showExpenses?: boolean;
    showItinerary?: boolean;
    showCover?: boolean;
  };
  user?: TripUser | string;
};

type ExpenseType = {
  _id: string;
  name: string;
  amount: number;
  currency: string;
  category?: string;
};

export default function TripPage() {
  const params = useParams();
  const tripId = params?.tripId as string | undefined;

  const session = useAuth();
  const currentUser = session?.user;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!tripId) return;

    let ignore = false;

    async function fetchData() {
      setLoading(true);
      try {
        const [tripRes, expRes] = await Promise.all([
          fetch(`/api/trips/${tripId}`, { cache: "no-store" }),
          fetch(`/api/trips/${tripId}/expenses`, { cache: "no-store" }),
        ]);

        if (!tripRes.ok) throw new Error("Failed to load trip");
        const tripData: Trip = await tripRes.json();

        const expData = expRes.ok ? await expRes.json() : [];

        if (!ignore) {
          setTrip(tripData);
          setExpenses(expData || []);
        }
      } catch (err) {
        console.error("Error loading trip:", err);
        if (!ignore) {
          setTrip(null);
          setExpenses([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [tripId]);

  if (loading) return <Loading />;

  if (!trip) {
    return (
      <div className="pt-24 px-4">
        <p className="text-sm text-slate-500">Trip not found.</p>
      </div>
    );
  }

  const privacy = trip.privacy || {};
  const showCities = privacy.showCities !== false;
  const showExpenses = privacy.showExpenses !== false;
  const showCover = privacy.showCover !== false;

  const ownerId =
    typeof trip.user === "string" ? trip.user : trip.user?._id;
  // Prefer `createdByName` returned by the API (consistent with the list endpoint),
  // otherwise fall back to populated `trip.user` or unknown.
  const creatorName =
    // @ts-ignore -- createdByName may be present on API response
    (trip as any).createdByName ||
    (typeof trip.user === "object"
      ? `${trip.user.first_name || ""} ${trip.user.last_name || ""}`.trim() ||
        "Unknown traveler"
      : "Unknown traveler");

  const isOwner = !!(currentUser && ownerId && currentUser.id === ownerId);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <header className="space-y-3">
          {showCover && trip.coverImage && (
            <div className="rounded-3xl overflow-hidden shadow-md bg-slate-200 max-h-64 fade-up">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={trip.coverImage}
                alt={trip.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 fade-up fade-up-delay-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
                {trip.title}
              </h1>
              <p className="text-sm text-slate-600">
                {new Date(trip.startDate).toLocaleDateString()} –{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </p>
              {showCities && (
                <p className="text-xs text-slate-500 mt-1">
                  {trip.cities?.map((c) => `${c.name}, ${c.country ?? ""}`).join(" · ") ||
                    "No cities added yet"}
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                Created by{" "}
                <span className="font-medium text-slate-600">
                  {creatorName}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${trip.isPublic
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
              >
                {trip.isPublic ? "Public" : "Private"}
              </span>

              <Link
                href="/trips"
                className="text-xs md:text-sm rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition"
              >
                Back to my trips
              </Link>

              {isOwner && (
                <Link
                  href={`/trips/${trip._id}/edit`}
                  className="text-xs md:text-sm inline-flex items-center rounded-full bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-500 transition"
                >
                  Edit trip
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Overview & itinerary area */}
          <section className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-4 md:p-5 fade-up fade-up-delay-2">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
                Overview
              </h2>
              <p className="text-xs md:text-sm text-slate-600 mb-3">
                Here you will later see itinerary, key highlights and AI-generated suggestions
                for this trip. For now this section is a simple overview of your dates and
                destinations.
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-xs md:text-sm text-slate-700">
                <div>
                  <dt className="font-medium">Start</dt>
                  <dd>{new Date(trip.startDate).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="font-medium">End</dt>
                  <dd>{new Date(trip.endDate).toLocaleString()}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-medium">Cities</dt>
                  <dd>
                    {trip.cities
                      ?.map((c) => `${c.name}, ${c.country ?? ""}`)
                      .join(" · ") || "No cities added"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Expenses dashboard */}
            {showExpenses && (
              <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-4 md:p-5 fade-up fade-up-delay-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm md:text-base font-semibold text-slate-900">
                    Expenses
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    {expenses.length} item(s)
                  </span>
                </div>

                {expenses.length === 0 ? (
                  <p className="text-xs md:text-sm text-slate-500">
                    No expenses added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {expenses.map((e) => (
                      <article key={e._id} className="expense rounded p-2 bg-white border">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2 align-items-center">
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f1f1' }} />
                            <div>
                              <p className="fw-bolder mb-0">{e.name}</p>
                              <small className="text-muted">{e.category || 'Misc'}</small>
                            </div>
                          </div>
                          <p className="mb-0">{String(e.amount)} {e.currency}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Side note for visitors / owners */}
          <aside className="space-y-4 fade-up fade-up-delay-4">
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-4 md:p-5">
              <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
                Trip visibility
              </h3>
              <p className="text-xs md:text-sm text-slate-600">
                This is a {trip.isPublic ? "public" : "private"} trip created by{" "}
                <span className="font-medium">{creatorName}</span>.
              </p>
              {isOwner ? (
                <p className="mt-2 text-[11px] text-slate-500">
                  You can edit this trip&apos;s details, cover image and privacy settings using
                  the <span className="font-semibold">Edit trip</span> button above.
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500">
                  You are viewing a shared version of this trip. Some details may be hidden
                  based on the creator&apos;s privacy settings.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
