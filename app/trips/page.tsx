"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CreateTripModal from "@/app/components/trip/createTripModal";
import { Navbar } from "@/app/components/navigation/navbar";
import { useAuth } from "@/lib/hook/useAuth";
import { useRouter } from "next/navigation";

type City = { name: string; country: string };

type Trip = {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    cities: City[];
    isPublic?: boolean;
};

type TripsResponse = {
    items: Trip[];
    page: number;
    pages: number;
    total: number;
};

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
                    fetch(`/api/trips?${new URLSearchParams({ ...Object.fromEntries(baseParams), status: "ongoing" })}`),
                    fetch(`/api/trips?${new URLSearchParams({ ...Object.fromEntries(baseParams), status: "upcoming" })}`),
                    fetch(`/api/trips?${new URLSearchParams({ ...Object.fromEntries(baseParams), status: "past" })}`),
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
    }, [q, startDate, endDate]);

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
    }, [page, q, startDate, endDate, status, activeTab]);

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
            return (
                <div className="text-muted">
                    No trips in this category yet.
                </div>
            );
        }

        return (
            <div className="row g-3 mb-3">
                {trips.map((t) => (
                    <div className="col-12 col-md-6 col-lg-4" key={t._id}>
                        <div className="card h-100">
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">
                                    <Link href={`/trips/${t._id}`}>{t.title}</Link>
                                </h5>
                                <p className="card-text mb-1 text-muted small">
                                    {t.cities
                                        ?.map((c) => `${c.name}, ${c.country}`)
                                        .join(" · ") || "—"}
                                </p>
                                <p className="card-text mb-1 text-muted small">
                                    {new Date(t.startDate).toLocaleDateString()} –{" "}
                                    {new Date(t.endDate).toLocaleDateString()}
                                </p>

                                <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
                                    <span className="text-muted small">
                                        Created by <strong>You</strong>
                                    </span>
                                    {t.isPublic && (
                                        <span className="badge bg-outline-secondary text-muted border">
                                            Public
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container py-5">
            <Navbar />
            {/* spacer so content isn't hidden under the fixed navbar */}
            <div style={{ height: "4.5rem" }} />

            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="mb-0">My trips</h1>
                <div className="d-flex gap-2 align-items-center">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setFiltersOpen((v) => !v)}
                    >
                        Filters
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#createTripModal"
                    >
                        Create Trip
                    </button>
                </div>
            </div>

            {/* � Search bar outside filters */}
            <form onSubmit={onSearch} className="mb-3">
                <div className="input-group">
                    <input
                        className="form-control"
                        placeholder="Search destination, country, or trip name"
                        value={qInput}
                        onChange={(e) => setQInput(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">
                        Search
                    </button>
                </div>
            </form>

            {/* 🔎 Additional filters inside a collapsible panel */}
            {filtersOpen && (
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-2">
                            <div className="col-6 col-lg-3">
                                <label className="form-label small text-muted">Start date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={startDateInput}
                                    onChange={(e) =>
                                        setStartDateInput(e.target.value)
                                    }
                                />
                            </div>

                            <div className="col-6 col-lg-3">
                                <label className="form-label small text-muted">End date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={endDateInput}
                                    onChange={(e) =>
                                        setEndDateInput(e.target.value)
                                    }
                                />
                            </div>

                            <div className="col-6 col-lg-3">
                                <label className="form-label small text-muted">Status</label>
                                <select
                                    className="form-select"
                                    value={statusInput}
                                    onChange={(e) =>
                                        setStatusInput(
                                            e.target.value as StatusFilter
                                        )
                                    }
                                >
                                    <option value="all">All trips</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="past">Past</option>
                                </select>
                            </div>

                            <div className="col-6 col-lg-3 d-flex align-items-end">
                                <button
                                    className="btn btn-primary w-100"
                                    type="button"
                                    onClick={onSearch}
                                >
                                    Apply filters
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

            {!loading && items.length > 0 && (
                <>
                    {/* Tabs for ongoing / upcoming / past */}
                    <ul className="nav nav-pills mb-3">
                        <li className="nav-item">
                            <button
                                className={
                                    "nav-link" +
                                    (activeTab === "ongoing" ? " active" : "")
                                }
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
                                className={
                                    "nav-link" +
                                    (activeTab === "upcoming" ? " active" : "")
                                }
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
                                className={
                                    "nav-link" +
                                    (activeTab === "past" ? " active" : "")
                                }
                                type="button"
                                onClick={() => switchTab("past")}
                            >
                                Past{" "}
                                <span className="badge bg-light text-dark ms-1">
                                    {pastCount}
                                </span>
                            </button>
                        </li>
                    </ul>

                    {/* Render trips for the active tab */}
                    {renderTripGrid(items)}
                </>
            )}

            {/* Pagination */}
            {pages > 1 && (
                <div className="d-flex gap-2 mt-4 align-items-center">
                    <button
                        className="btn btn-outline-secondary"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Prev
                    </button>
                    <span className="align-self-center">
                        Page {page} / {pages}
                    </span>
                    <button
                        className="btn btn-outline-secondary"
                        disabled={page >= pages}
                        onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modal component must be rendered on this page */}
            <CreateTripModal />
        </div>
    );
}