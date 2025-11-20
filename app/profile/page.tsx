"use client";

import { useAuth } from "@/lib/hook/useAuth";
import { UserCard } from "@/app/components/user/userCard";
import CreateTripModal from "@/app/components/trip/createTripModal";
import UserEditModal from "@/app/components/user/userEditModal";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/app/components/navigation/navbar";

type City = { name: string; country?: string };
type Trip = {
  _id: string;
  title: string;
  startDate: string;
  endDate?: string;
  cities?: City[];
  userId?: string;
};

export default function ProfilePage() {
  const session = useAuth();
  const [upcoming, setUpcoming] = useState<Trip[]>([]);
  const user = session?.user;

  useEffect(() => {
    async function fetchUpcoming() {
      if (!user) return;
      try {
        const res = await fetch(
          `/api/trips?userId=${user.id}&upcoming=1`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        setUpcoming(data.items || []);
      } catch (err) {
        console.error("Failed to load upcoming trips:", err);
      }
    }

    fetchUpcoming();
  }, [user]);

  if (!user) {
    return (
      <div className="container py-5">
        <p className="text-muted">User not found. Please log in.</p>
      </div>
    );
  }

  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email ||
    "Traveler";

  return (
    <div className="container py-4">
      <Navbar />

      {/* Hero header, same style language as trips page */}
      <div className="rounded-4 p-4 mb-4 shadow-sm bg-light border fade-up mt-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            {/* User avatar / info */}
            <div className="rounded-circle bg-white border d-flex align-items-center justify-content-center profile-avatar">
              <span className="fw-bold text-primary">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="fw-bold mb-1">{displayName}</h2>
              <div className="text-muted small">
                This is your travel dashboard – keep track of your trips and plans.
              </div>
            </div>
          </div>

          <div className="d-flex flex-column align-items-end gap-2">
            <div className="d-flex gap-3 text-muted small mb-1">
              <div className="profile-stat text-end">
                <span className="d-block fw-semibold fs-5">
                  {upcoming.length}
                </span>
                <span className="d-block text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Upcoming trips</span>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Link
                href="/trips"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
              >
                <i className="bi bi-list-ul" />
                View all trips
              </Link>
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                data-bs-toggle="modal"
                data-bs-target="#createTripModal"
              >
                <i className="bi bi-plus-lg" />
                New Trip
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="row g-4">
        {/* Left column: profile / quick actions */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm mb-3 fade-up fade-up-delay-1">
            <div className="card-body">
              {/* Existing user card inside a cleaner container */}
              <UserCard firstName={user.first_name} lastName={user.last_name} />
            </div>
          </div>

          <div className="card border-0 shadow-sm fade-up fade-up-delay-2">
            <div className="card-body">
              <h5 className="card-title mb-3 fw-bold">Quick Actions</h5>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                  data-bs-toggle="modal"
                  data-bs-target="#createTripModal"
                >
                  <i className="bi bi-plus-circle" />
                  Create new trip
                </button>
                <Link
                  href="/trips"
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-geo-alt" />
                  See all trips
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: upcoming trips list */}
        <div className="col-12 col-lg-8 fade-up fade-up-delay-2">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h4 className="mb-0">Upcoming Adventures</h4>
              <small className="text-muted">
                Trips with start dates in the future.
              </small>
            </div>
            <span className="badge bg-light text-dark">
              {upcoming.length} trip{upcoming.length === 1 ? "" : "s"}
            </span>
          </div>

          {upcoming.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-3">
                  <i className="bi bi-airplane fs-1 text-muted" />
                </div>
                <p className="mb-1 fw-semibold">No upcoming trips yet.</p>
                <p className="text-muted small mb-3">
                  Start planning your next adventure with a new trip.
                </p>
                <button
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#createTripModal"
                >
                  Plan a trip
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {upcoming.map((t) => {
                const cities =
                  t.cities?.length
                    ? t.cities.map((c) => c.name).join(", ")
                    : "No cities added";
                const startDate = new Date(t.startDate);
                const endDate = t.endDate ? new Date(t.endDate) : null;

                return (
                  <Link
                    key={t._id}
                    href={`/trips/${t._id}`}
                    className="text-decoration-none text-reset"
                  >
                    <div className="card border-0 shadow-sm hover-lift position-relative overflow-hidden">
                      <div className="card-body d-flex justify-content-between align-items-start">
                        <div className="me-3">
                          <h5 className="card-title mb-1">
                            {t.title}
                          </h5>
                          <div className="text-muted small mb-1">
                            <i className="bi bi-geo-alt me-1" />
                            {cities}
                          </div>
                          <div className="text-muted small">
                            {startDate.toLocaleDateString()}{" "}
                            {endDate &&
                              `– ${endDate.toLocaleDateString()}`}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="badge bg-primary-subtle text-primary mb-1">
                            {startDate.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-muted small">
                            {startDate.getFullYear()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateTripModal onClose={() => { }} />
      <UserEditModal onClose={() => { }} />
    </div>
  );
}
