"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

    useEffect(() => { fetchTrips(); }, [page]);

    const onSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        await fetchTrips({ q, page: 1 });
    };

    return (
        <div className="container py-5">
            <h1 className="mb-4">Explore Trips</h1>

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
                <div className="row g-3">
                    {items.map((t) => (
                        <div className="col-12 col-md-6 col-lg-4" key={t._id}>
                            <div className="card h-100">
                                {/* You can add cover image later (US321) */}
                                <div className="card-body">
                                    <h5 className="card-title">{t.title}</h5>
                                    <p className="card-text">
                                        {t.cities?.map(c => `${c.name}, ${c.country}`).join(" · ") || "—"}
                                    </p>
                                    <Link className="btn btn-outline-primary" href={`/trips/${t._id}`}>
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pages > 1 && (
                <div className="d-flex gap-2 mt-4">
                    <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                    <span className="align-self-center">Page {page} / {pages}</span>
                    <button className="btn btn-outline-secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
                </div>
            )}
        </div>
    );
}
