"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Loading } from "@/app/components/ui/loading";
import { useAuth } from "@/lib/hook/useAuth";

import { TripOverview } from "@/app/components/trip/tripOverview";
import { AddFlight } from "@/app/components/trip/addFlight";
import { FlightList } from "@/app/components/trip/flightList";
import { AddLocation } from "@/app/components/trip/addLocation";
import { LocationList } from "@/app/components/trip/locationList";

import { PackingListSection } from "@/app/components/trip/packingList";

import { MustVisitLocation } from "@/types/location/types";
import { TripPlannerSection } from "@/app/components/trip/tripPlanner";
import { TripSettingsSection } from "@/app/components/trip/tripSettings";
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
import {formatTripDateRange} from "@/lib/utils";
import IconText from "@/app/components/ui/icon-text";
import {router} from "next/client";

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
  const [locations, setLocations] = useState<MustVisitLocation[]>([]);

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
          setLocations(Array.isArray(tripData.mustVisitLocations) ? tripData.mustVisitLocations : []);
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
        if (!trip.cities || trip.cities.length === 0) return;
        const results = await Promise.all(
          (trip.cities || []).map(async (city) => {
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
        <div className="min-vh-100 pt-5 pb-4 px-3">
            <div className="container-fluid" style={{ maxWidth: "1140px" }}>

                {/* HEADER */}
                <header className="mb-4">
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
                            <img
                                src={trip.coverImage}
                                alt={trip.title}
                                className="w-100 object-fit-cover"
                                style={{ height: "23rem" }}
                            />
                        </div>
                    )}

                    <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3">
                        <div className="w-100">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <h1 className="fs-4 fs-md-3 fw-semibold text-dark mb-0">
                                    {trip.title}
                                </h1>

                                <div
                                    className="d-flex align-items-center badge bg-light text-dark fw-normal"
                                    style={{ fontSize: "15px" }}
                                >
                                    {trip.currency?.code === "EUR" && <span className="me-1">🇪🇺</span>}
                                    {trip.currency?.code === "USD" && <span className="me-1">🇺🇸</span>}
                                    {trip.currency?.code}
                                </div>
                            </div>

                            {showCities && (
                                <p className="text-muted small mb-1">
                                    {trip.cities?.length
                                        ? trip.cities
                                            .map((c) =>
                                                c.country && c.country !== "Unknown"
                                                    ? `${c.name}, ${c.country}`
                                                    : c.name
                                            )
                                            .join(" · ")
                                        : "No cities added yet"}
                                </p>
                            )}

                            <p className="text-secondary small mb-1">
                                {formatTripDateRange(trip.startDate, trip.endDate)}
                            </p>

                            <div className="d-flex justify-content-between align-items-center">
                                <span className="d-block text-muted small">
                                    Created by{" "}
                                    <Link href={"/profile/" + trip.owner._id}>
                                        <strong className="fw-medium text-secondary">
                                            {creatorName}
                                        </strong>
                                    </Link>
                                </span>
                                {isOwner && (
                                    <Link
                                        href={`/trips/${trip._id}/edit`}
                                        className="btn btn-primary btn-sm rounded-pill"
                                    >
                                        Edit trip
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* MAIN GRID */}
                <div className="row g-4">

                    {/* MAIN CONTENT */}
                    <section className="col-lg-8">

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
                            <div className="card shadow-sm border mb-4">
                                <div className="card-body p-3 p-md-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h2 className="fs-5 fs-md-3 fw-semibold text-dark mb-0">Flights</h2>
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
                                    <span className="text-muted small">
                  {flights.length} flight(s)
                </span>

                                    <FlightList
                                        flights={flights}
                                        tripId={tripId as string}
                                        isOwner={isOwner}
                                        onFlightDeleted={(flightId) => {
                                            setFlights((prev) =>
                                                prev.filter((f) => f._id !== flightId)
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {showItinerary && (
                            <div className="card shadow-sm border mb-4">
                                <div className="card-body p-3 p-md-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h2 className="fs-5 fs-md-3 fw-semibold text-dark mb-0">
                                            Must-Visit Locations
                                        </h2>
                                        <AddLocation
                                            tripId={tripId as string}
                                            userId={trip.owner._id as string}
                                            onLocationAdded={(newLocation) => {
                                                setLocations((prev) =>
                                                    prev.some((l) => l._id === newLocation._id)
                                                        ? prev
                                                        : [...prev, newLocation]
                                                );
                                            }}
                                        />
                                    </div>

                                    <span className="text-muted small my-4">
                  {locations.length} location(s)
                </span>

                                    <LocationList
                                        locations={locations}
                                        tripId={tripId as string}
                                        isOwner={isOwner}
                                        onLocationDeleted={(locationId) => {
                                            setLocations((prev) =>
                                                prev.filter((l) => l._id !== locationId)
                                            );
                                        }}
                                        onLocationUpdated={(updatedLocation) => {
                                            setLocations((prev) =>
                                                prev.map((l) =>
                                                    l._id === updatedLocation._id ? updatedLocation : l
                                                )
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {showItinerary && (
                            <TripPlannerSection
                                tripId={tripId as string}
                                isOwner={isOwner}
                            />
                        )}

                        {showItinerary && (
                            <PackingListSection
                                tripId={tripId as string}
                                isOwner={isOwner}
                            />
                        )}
                    </section>

                    {/* SIDEBAR */}
                    <aside className="col-lg-4">
                        <TripSettingsSection
                            tripId={tripId as string}
                            isPublic={trip.isPublic ?? false}
                            publicSlug={(trip as any).publicSlug}
                            isOwner={isOwner}
                            creatorName={creatorName}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
}
