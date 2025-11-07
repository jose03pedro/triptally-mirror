import Link from "next/link";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import mongoose from "mongoose";

async function getTrip(tripId?: string | null) {
    if (!tripId) return null;

    console.log("[TripPage] getTrip called with id:", tripId);
    await connectionToDB();

    let trip = null;
    try {
        if (mongoose.isValidObjectId(tripId)) {
            trip = await Trip.findById(tripId).lean();
            console.log("[TripPage] findById result:", !!trip);
        }
    } catch (err) {
        console.warn("[TripPage] findById error:", err);
    }

    if (!trip) {
        try {
            const decoded = decodeURIComponent(tripId);
            if (decoded !== tripId && mongoose.isValidObjectId(decoded)) {
                trip = await Trip.findById(decoded).lean();
                console.log("[TripPage] findById after decode result:", !!trip);
            }
        } catch (err) {
            console.warn("[TripPage] decode/second find error:", err);
        }
    }

    // API fallback: only attempt when we have an absolute base URL configured.
    if (!trip && process.env.NEXT_PUBLIC_BASE_URL) {
        try {
            const base = process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
            const url = `${base}/api/trips/${encodeURIComponent(tripId)}`;
            const apiRes = await fetch(url, { cache: "no-store" });
            if (apiRes.ok) {
                const data = await apiRes.json();
                // support both { trip } and plain trip return shapes
                trip = data.trip ?? data;
                console.log("[TripPage] fetched from API fallback", !!trip);
            }
        } catch (err) {
            console.warn("[TripPage] API fallback error:", err);
        }
    }

    if (!trip) return null;
    return JSON.parse(JSON.stringify(trip));
}

export default async function TripPage({ params }: { params: Promise<{ tripId?: string }> }) {
    // Next.js may pass `params` as a Promise in some RSC contexts. Await it
    // so we safely access `tripId` and avoid the runtime message.
    const resolved = await params;
    const tripId = resolved?.tripId;

    if (!tripId) {
        console.warn("[TripPage] no tripId in params:", resolved);
        return (
            <div className="container py-5">
                <p>Trip not found (missing id).</p>
                <Link href="/trips" className="btn btn-outline-secondary mt-3">Back to Trips</Link>
            </div>
        );
    }

    const trip = await getTrip(String(tripId));
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
                {trip.cities?.map((c: { name: string; country?: string }) => `${c.name}, ${c.country}`).join(" · ") || "—"}
            </div>

            {/* Placeholders for future stories (expenses, itinerary, participants) */}
            <div className="alert alert-info">
                Trip details sections (Itinerary, Expenses, Participants) go here.
            </div>
        </div>
    );
}
