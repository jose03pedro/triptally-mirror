"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CreateTripModal from "@/app/components/trip/createTripModal";
import { Navbar } from "@/app/components/navigation/navbar";

type City = { name: string; country: string };
type Trip = {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    cities: City[];
};

export default function TripsPage() {
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [items, setItems] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrips = async (params?: { q?: string; page?: number }) => {
        setLoading(true);
        const usp = new URLSearchParams({
            q: params?.q ?? q,
            page: String(params?.page ?? page),
            limit: "12",
        });
        const res = await fetch(`/api/trips?${usp.toString()}`, { cache: "no-store" });
        const data = await res.json();
        setItems(data.items || []);
        setPages(data.pages || 1);
        setLoading(false);
    };

    useEffect(() => {
        // Wrap the fetch in an async function so state updates happen asynchronously
        // and avoid calling setState synchronously within the effect body.
        const doFetch = async () => {
            await Promise.resolve();
            await fetchTrips();
        };
        doFetch();
    }, [page]);

    const onSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        await fetchTrips({ q, page: 1 });
    };

    const [collapsedUpcoming, setCollapsedUpcoming] = useState(false);
    const [collapsedPast, setCollapsedPast] = useState(true);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d;
    }, []);

    const upcoming = useMemo(() => items.filter(t => new Date(t.endDate) >= today).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()), [items, today]);
    const past = useMemo(() => items.filter(t => new Date(t.endDate) < today).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()), [items, today]);

    return (
        <div className="container py-5">
            <Navbar />
            {/* spacer so content isn't hidden under the fixed navbar */}
            <div style={{ height: "4.5rem" }} />

            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="mb-0">Explore Trips</h1>

                <div className="d-flex gap-2 align-items-center">
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createTripModal">
                        Create Trip
                    </button>
                </div>
            </div>

            <form onSubmit={onSearch} className="mb-4 d-flex gap-2">
                <input
                    className="form-control"
                    placeholder="Search destination, country, or trip name"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <button className="btn btn-primary" type="submit">Search</button>
            </form>

            {loading ? (
                <p>Loading…</p>
            ) : items.length === 0 ? (
                <p>No trips found.</p>
            ) : (
                <>
                    {/* Upcoming Section */}
                    <section className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="mb-0">Upcoming trips ({upcoming.length})</h5>
                            <button className="btn btn-sm btn-link" onClick={() => setCollapsedUpcoming(s => !s)} aria-expanded={!collapsedUpcoming}>
                                {collapsedUpcoming ? "Show" : "Hide"}
                            </button>
                        </div>

                        {collapsedUpcoming ? (
                            <div className="text-muted">{upcoming.length} upcoming trip{upcoming.length !== 1 ? "s" : ""} — click Show to expand</div>
                        ) : upcoming.length === 0 ? (
                            <div className="text-muted">No upcoming trips.</div>
                        ) : (
                            <div className="row g-3 mb-3">
                                {upcoming.map((t) => (
                                    <div className="col-12 col-md-6 col-lg-4" key={t._id}>
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h5 className="card-title">{t.title}</h5>
                                                <p className="card-text mb-1">{t.cities?.map(c => `${c.name}, ${c.country}`).join(" · ") || "—"}</p>
                                                <p className="text-muted small mb-0">{new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}</p>
                                                <Link className="btn btn-outline-primary mt-2" href={`/trips/${t._id}`}>View Details</Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Past Section */}
                    <section className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="mb-0">Past trips ({past.length})</h5>
                            <button className="btn btn-sm btn-link" onClick={() => setCollapsedPast(s => !s)} aria-expanded={!collapsedPast}>
                                {collapsedPast ? "Show" : "Hide"}
                            </button>
                        </div>

                        {collapsedPast ? (
                            <div className="text-muted">{past.length} past trip{past.length !== 1 ? "s" : ""} — click Show to expand</div>
                        ) : past.length === 0 ? (
                            <div className="text-muted">No past trips.</div>
                        ) : (
                            <div className="row g-3 mb-3">
                                {past.map((t) => (
                                    <div className="col-12 col-md-6 col-lg-4" key={t._id}>
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h5 className="card-title">{t.title}</h5>
                                                <p className="card-text mb-1">{t.cities?.map(c => `${c.name}, ${c.country}`).join(" · ") || "—"}</p>
                                                <p className="text-muted small mb-0">{new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}</p>
                                                <Link className="btn btn-outline-primary mt-2" href={`/trips/${t._id}`}>View Details</Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {pages > 1 && (
                <div className="d-flex gap-2 mt-4">
                    <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                    <span className="align-self-center">Page {page} / {pages}</span>
                    <button className="btn btn-outline-secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
                </div>
            )}
            {/* Render create modal so the Create Trip button can open it */}
            <CreateTripModal />
        </div>
    );
}
