"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CreateTripModal from "@/app/components/trip/createTripModal";
import { Navbar } from "@/app/components/navigation/navbar";
import { Loading } from "@/app/components/ui/loading";
import { useAuth } from "@/lib/hook/useAuth";
import { useRouter } from "next/navigation";
import TripCard from "../components/trip/tripCard";
import { Trip, TripsResponse } from "@/types/trip/types";

type StatusFilter = "all" | "upcoming" | "past" | "ongoing";
type Tab = "ongoing" | "upcoming" | "past";

export default function TripsPage() {
  const session = useAuth();
  const user = session?.user;
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (session === null) {
      router.push("/login");
    }
  }, [session, router]);

  // Form input values (inside filter panel)
  const [qInput, setQInput] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("all");

  // Applied filters (used in the actual API call)
  const [q, setQ] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [items, setItems] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  // Counts for each tab
  const [ongoingCount, setOngoingCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pastCount, setPastCount] = useState(0);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("ongoing");

  // Fetch counts for all tabs (separate from main data)
  useEffect(() => {
    let ignore = false;

    async function fetchCounts() {
      if (!user) return;
      try {
        const baseParams = new URLSearchParams({ limit: "0", userId: user.id });
        if (q) baseParams.set("q", q);
        if (startDate) baseParams.set("startDate", startDate);
        if (endDate) baseParams.set("endDate", endDate);

        const [ongoingRes, upcomingRes, pastRes] = await Promise.all([
          fetch(
            `/api/trips?${new URLSearchParams({
              ...Object.fromEntries(baseParams),
              status: "ongoing",
            })}`
          ),
          fetch(
            `/api/trips?${new URLSearchParams({
              ...Object.fromEntries(baseParams),
              status: "upcoming",
            })}`
          ),
          fetch(
            `/api/trips?${new URLSearchParams({
              ...Object.fromEntries(baseParams),
              status: "past",
            })}`
          ),
        ]);

        if (!ignore) {
          const ongoing = await ongoingRes.json();
          const upcoming = await upcomingRes.json();
          const past = await pastRes.json();

          setOngoingCount(ongoing.total || 0);
          setUpcomingCount(upcoming.total || 0);
          setPastCount(past.total || 0);
        }
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    }

    fetchCounts();

    return () => {
      ignore = true;
    };
  }, [q, startDate, endDate, user]);

  // Fetch trips whenever applied filters, page, OR active tab changes
  useEffect(() => {
    let ignore = false;

    async function fetchTrips() {
      if (!user) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "12",
          userId: user.id,
        });

        if (q) params.set("q", q);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        // Use the active tab to determine status filter
        if (activeTab === "ongoing") {
          params.set("status", "ongoing");
        } else if (activeTab === "upcoming") {
          params.set("status", "upcoming");
        } else if (activeTab === "past") {
          params.set("status", "past");
        } else if (status && status !== "all") {
          params.set("status", status);
        }

        const res = await fetch(`/api/trips?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch trips");

        const data: TripsResponse = await res.json();
        if (!ignore) {
          setItems(data.items || []);
          setPages(data.pages || 1);
        }
      } catch (err) {
        console.error("Error fetching trips:", err);
        if (!ignore) {
          setItems([]);
          setPages(1);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchTrips();

    return () => {
      ignore = true;
    };
  }, [page, q, startDate, endDate, status, activeTab, user]);

  // Apply filters when user clicks "Apply filters"
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // reset pagination
    setQ(qInput.trim());
    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setStatus(statusInput);
    setFiltersOpen(false);
  };

  // Helper to switch tabs and reset pagination
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Helper to render cards for a list of trips
  const renderTripGrid = (trips: Trip[]) => {
    if (trips.length === 0) {
      return <div className="text-muted">No trips in this category yet.</div>;
    }

    return (
      <div className="row g-3 mb-3">
        {trips.map((t) => (
          <div className="col-12 col-md-6 col-lg-4 ">
            <TripCard key={t._id} trip={t} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-5">
      <Navbar />
      {/* spacer so content isn't hidden under the fixed navbar */}
      <div style={{ height: "2.5rem" }} />

      {/* Page header / hero */}
      <div className="rounded-4 p-4 mb-4 shadow-sm bg-light border fade-up">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">My Trips</h2>
            <div className="text-muted">
              Plan, track & explore your adventures.
            </div>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <i className="bi bi-funnel me-1" />
              Filters
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#createTripModal"
            >
              <i className="bi bi-plus-lg me-1" />
              Create Trip
            </button>
          </div>
        </div>
      </div>

      {/* Search bar in its own card */}
      <div className="card border-0 shadow-sm mb-4 p-3 fade-up-delay-1">
        <form onSubmit={onSearch}>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search" />
            </span>
            <input
              className="form-control border-start-0"
              placeholder="Search destination, country, or trip name"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Tabs for ongoing / upcoming / past */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={"nav-link" + (activeTab === "ongoing" ? " active" : "")}
            type="button"
            onClick={() => switchTab("ongoing")}
          >
            Ongoing{" "}
            <span className="badge bg-light text-dark ms-1">
              {ongoingCount}
            </span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={"nav-link" + (activeTab === "upcoming" ? " active" : "")}
            type="button"
            onClick={() => switchTab("upcoming")}
          >
            Upcoming{" "}
            <span className="badge bg-light text-dark ms-1">
              {upcomingCount}
            </span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={"nav-link" + (activeTab === "past" ? " active" : "")}
            type="button"
            onClick={() => switchTab("past")}
          >
            Past{" "}
            <span className="badge bg-light text-dark ms-1">{pastCount}</span>
          </button>
        </li>
      </ul>

      {/* Additional filters inside a collapsible panel */}
      {filtersOpen && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h6 className="text-muted mb-3">Filters</h6>
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <div className="filter-label">Start date</div>
                <input
                  type="date"
                  className="form-control"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-3">
                <div className="filter-label">End date</div>
                <input
                  type="date"
                  className="form-control"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-3 d-flex align-items-end">
                <button
                  className="btn btn-primary w-100"
                  type="button"
                  onClick={onSearch}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <p>Loading trips...</p>}

      {!loading && items.length === 0 && (
        <p className="text-muted">No trips found with these filters.</p>
      )}

      {!loading && items.length > 0 && <>{renderTripGrid(items)}</>}

      {/* Pagination */}
      {pages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <div className="pagination-custom rounded-pill shadow-sm p-2 bg-white d-inline-flex align-items-center">
            <button
              className="btn btn-sm btn-outline-secondary me-2"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="px-3 small">
              Page {page} / {pages}
            </span>
            <button
              className="btn btn-sm btn-outline-secondary ms-2"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal component must be rendered on this page */}
      <CreateTripModal onClose={() => {}} />
    </div>
  );
}
