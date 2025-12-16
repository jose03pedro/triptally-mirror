"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Loading } from "@/app/components/ui/loading";
import { useAuth } from "@/lib/hook/useAuth";

import { TripOverview } from "@/app/components/trip/tripOverview";
import { AddFlight } from "@/app/components/trip/addFlight";
import { FlightList } from "@/app/components/trip/flightList";

import { PackingListSection } from "@/app/components/trip/packingList";
import { ExpenseSection } from "@/app/components/expenses/expenseSection";
import { WeatherSection } from "@/app/components/weather/weatherSection";

import { Trip } from "@/types/trip/types";
import { ExpenseWithConverted } from "@/types/expense/types";
import { ExpenseCategory } from "@/types/expensecategory/types";
import { Currency } from "@/types/currency/types";
import {
  DayWeather,
  WeatherDisplayData,
  WeatherIconType,
  WeatherResponse,
} from "@/types/weather/types";

export default function TripPage() {
  const params = useParams();
  const tripId = params?.tripId as string | undefined;

  const session = useAuth();
  const currentUser = session?.user;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<ExpenseWithConverted[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [flights, setFlights] = useState<any[]>([]);

  const [weatherData, setWeatherData] = useState<WeatherResponse[]>([]);
  const [weatherDisplay, setWeatherDisplay] = useState<WeatherDisplayData[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  const [loading, setLoading] = useState<boolean>(true);

  const parseWeatherRes = (data: WeatherResponse, start: string, end: string) => {
    if (!data) return;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const city = data.resolvedAddress;

    const filteredDays: DayWeather[] = data.days
      .filter((day) => {
        const d = new Date(day.datetime);
        return d >= startDate && d <= endDate;
      })
      .map((item) => ({
        date: item.datetime,
        icon: item.icon as WeatherIconType,
        temperature: item.temp,
      }));

    if (filteredDays.length === 0) return;

    const formatted: WeatherDisplayData = { city, days: filteredDays };
    setWeatherDisplay((prev) => [...prev, formatted]);
  };

  useEffect(() => {
    if (!tripId) return;

    let ignore = false;

    async function fetchData() {
      setLoading(true);
      try {
        const [tripRes, expRes, currRes, catRes, flightsRes] = await Promise.all([
          fetch(`/api/trips/${tripId}`, { cache: "no-store" }),
          fetch(`/api/trips/${tripId}/expenses`, { cache: "no-store" }),
          fetch(`/api/currencies`, { cache: "no-store" }),
          fetch(`/api/expensecategories`, { cache: "no-store" }),
          fetch(`/api/trips/${tripId}/flights`, { cache: "no-store" }),
        ]);

        if (!tripRes.ok) {
          if (tripRes.status === 403) throw new Error("This trip is private or you don't have access.");
          if (tripRes.status === 404) throw new Error("Trip not found.");
          throw new Error("Failed to load trip");
        }

        const tripData: Trip = await tripRes.json();

        const expData = expRes.ok ? await expRes.json() : [];
        const currData = currRes.ok ? await currRes.json() : [];
        const catData = catRes.ok ? await catRes.json() : [];
        const flightsData = flightsRes.ok ? await flightsRes.json() : [];

        if (!ignore) {
          setTrip(tripData);
          setExpenses(expData.expenses || []);
          setCurrencies(currData || []);
          setCategories(catData || []);
          setFlights(Array.isArray(flightsData) ? flightsData : []);
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

  useEffect(() => {
    if (!trip?.cities?.length) {
      setIsLoadingWeather(false);
      return;
    }

    let ignore = false;

    const fetchWeatherPerCity = async () => {
      try {
        const results = await Promise.all(
          trip.cities.map(async (city) => {
            const res = await fetch(
              `/api/weather?location=${encodeURIComponent(city.name)}`,
              { cache: "no-store" }
            );
            if (!res.ok) return null;
            return (await res.json()) as WeatherResponse;
          })
        );

        if (ignore) return;

        const filtered = results.filter((r): r is WeatherResponse => r !== null);
        setWeatherData(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setIsLoadingWeather(false);
      }
    };

    setIsLoadingWeather(true);
    setWeatherDisplay([]); // evita duplicar quando volta a correr
    fetchWeatherPerCity();

    return () => {
      ignore = true;
    };
  }, [trip]);

  useEffect(() => {
    if (!trip || weatherData.length === 0) return;
    weatherData.forEach((data) => parseWeatherRes(data, trip.startDate, trip.endDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherData, trip]);

  if (loading || isLoadingWeather) return <Loading />;

  if (!trip) {
    return (
      <div className="pt-24 px-4">
        <p className="text-sm text-slate-500">Trip not found.</p>
      </div>
    );
  }

  const ownerId = trip.owner._id;

  const creatorName =
    currentUser?.id === trip.owner._id
      ? "You"
      : `${trip.owner?.first_name} ${trip.owner?.last_name}`;

  const isOwner = !!(currentUser && ownerId && currentUser.id === ownerId);
  const isPastTrip = new Date(trip.endDate) < new Date();

  const privacy = trip.privacy || {};
  const showCities = isOwner || privacy.showCities !== false;
  const showExpenses = isOwner || privacy.showExpenses !== false;
  const showItinerary = isOwner || privacy.showItinerary !== false;
  const showCover = isOwner || privacy.showCover !== false;

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

              <span className="text-[11px] text-slate-400 mt-1">
                Created by{" "}
                <Link href={"/profile/" + trip.owner._id}>
                  <strong className="font-medium text-slate-600">{creatorName}</strong>
                </Link>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  trip.isPublic
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {trip.isPublic ? "Public" : "Private"}
              </span>

              {currentUser && (
                <Link
                  href="/trips"
                  className="text-xs md:text-sm rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition"
                >
                  Back to my trips
                </Link>
              )}

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
          <section className="lg:col-span-2 space-y-4">
            <TripOverview trip={trip} />

            <WeatherSection
              isPastTrip={isPastTrip}
              weatherSnapshot={trip.lastWeatherSnapshot ?? {}}
              weatherDisplay={weatherDisplay}
            />

            {showExpenses && (
              <ExpenseSection
                trip={trip}
                expenses={expenses}
                setExpenses={setExpenses}
                currencies={currencies}
                categories={categories}
              />
            )}

            {showItinerary && (
              <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-4 md:p-5 fade-up fade-up-delay-3">
                <div className="mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <h2 className="text-sm md:text-base font-semibold text-slate-900">
                      Flights
                    </h2>
                    <AddFlight
                      tripId={tripId as string}
                      userId={trip.owner._id as string}
                      onFlightAdded={(newFlight) => {
                        setFlights((prev) =>
                          prev.some((f) => f._id === newFlight._id)
                            ? prev
                            : [...prev, newFlight]
                        );
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {flights.length} flight(s)
                  </span>
                </div>

                <FlightList
                  flights={flights}
                  tripId={tripId as string}
                  isOwner={isOwner}
                  onFlightDeleted={(flightId) => {
                    setFlights((prev) => prev.filter((f) => f._id !== flightId));
                  }}
                />
              </div>
            )}

            {/* Packing List section (reintroduzido do feature/packinglist) */}
            {showItinerary && (
              <div className="fade-up fade-up-delay-4">
                <PackingListSection tripId={tripId as string} isOwner={isOwner} />
              </div>
            )}
          </section>

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
                <>
                  <p className="mt-2 text-[11px] text-slate-500">
                    You can edit this trip&apos;s details, cover image and privacy settings using
                    the <span className="font-semibold">Edit trip</span> button above.
                  </p>
                  <div className="mt-3">
                    <Link
                      href={`/trips/${trip._id}/edit`}
                      className="text-xs md:text-sm inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition"
                    >
                      Edit details
                    </Link>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500">
                  You are viewing a shared version of this trip. Some details may be hidden based
                  on the creator&apos;s privacy settings.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
