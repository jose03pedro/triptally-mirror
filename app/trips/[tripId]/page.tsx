import Link from "next/link";

async function getTrip(tripId: string) {
    // Use a relative URL so this works both in dev and prod. When you need an
    // absolute URL for SSG/SSR behind proxies, set NEXT_PUBLIC_BASE_URL and
    // replace this accordingly.
    const res = await fetch(`/api/trips/${tripId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
}

export default async function TripPage({ params }: { params: { tripId: string } }) {
    const trip = await getTrip(params.tripId);
    if (!trip) {
        return (
            <div className="container py-5">
                <p>Trip not found.</p>
                <Link href="/trips" className="btn btn-outline-secondary mt-3">Back to Trips</Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <Link href="/trips" className="btn btn-link px-0 mb-3">← Back</Link>
            <h1 className="mb-3">{trip.title}</h1>

            <div className="mb-3">
                <strong>Dates:</strong>{" "}
                {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
            </div>

            <div className="mb-4">
                <strong>Destinations:</strong>{" "}
                {trip.cities?.map((c: any) => `${c.name}, ${c.country}`).join(" · ") || "—"}
            </div>

            {/* Placeholders for future stories (expenses, itinerary, participants) */}
            <div className="alert alert-info">
                Trip details sections (Itinerary, Expenses, Participants) go here.
            </div>
        </div>
    );
}
