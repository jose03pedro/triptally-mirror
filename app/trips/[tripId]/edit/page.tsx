"use client";

import { useEffect, useState, useActionState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateTrip } from "@/app/actions/updateTrip";
import { useAuth } from "@/lib/hook/useAuth";
import { Loading } from "@/app/components/ui/loading";
import TripCitiesInput, { City } from "@/app/components/trip/tripCitiesInput";

type TripUser = {
    _id: string;
};

type Trip = {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    cities?: City[];
    isPublic: boolean;
    coverImage?: string;
    privacy?: {
        showCities?: boolean;
        showExpenses?: boolean;
        showItinerary?: boolean;
        showCover?: boolean;
    };
    user?: TripUser | string;
};

type UpdateTripState = {
    success: boolean;
    errors: Record<string, string[]>;
};

export default function EditTripPage() {
    const params = useParams();
    const router = useRouter();
    const tripId = params?.tripId as string | undefined;

    const session = useAuth();
    const currentUser = session?.user;

    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverData, setCoverData] = useState<string>("");

    const initialState: UpdateTripState = { success: false, errors: {} };
    const [state, formAction, isPending] = useActionState(updateTrip, initialState);

    useEffect(() => {
        if (!tripId) return;

        let ignore = false;

        async function loadTrip() {
            setLoading(true);
            try {
                const res = await fetch(`/api/trips/${tripId}`, { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to load trip");
                const data: Trip = await res.json();
                if (!ignore) {
                    setTrip(data);
                    if (data.coverImage) setCoverPreview(data.coverImage);
                }
            } catch (err) {
                console.error(err);
                if (!ignore) setTrip(null);
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        loadTrip();
        return () => {
            ignore = true;
        };
    }, [tripId]);

    useEffect(() => {
        if (state.success) {
            router.push(`/trips/${tripId}`);
        }
    }, [state.success, router, tripId]);

    if (loading) return <Loading />;

    if (!trip) {
        return (
            <div className="pt-24 px-4">
                <p className="text-sm text-slate-500">Trip not found.</p>
            </div>
        );
    }

    const ownerId =
        typeof trip.user === "string" ? trip.user : trip.user?._id;
    const isOwner = !!(currentUser && ownerId && currentUser.id === ownerId);

    if (!isOwner) {
        // visitors cannot edit
        if (typeof window !== "undefined") {
            router.replace(`/trips/${tripId}`);
        }
        return null;
    }

    const privacy = trip.privacy || {};
    const showCities = privacy.showCities !== false;
    const showExpenses = privacy.showExpenses !== false;
    const showItinerary = privacy.showItinerary !== false;
    const showCover = privacy.showCover !== false;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = typeof reader.result === "string" ? reader.result : "";
            setCoverPreview(base64);
            setCoverData(base64);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="mx-auto max-w-3xl space-y-5">
                <header className="flex items-center justify-between gap-2 mb-2">
                    <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                        Edit trip
                    </h1>
                    <button
                        type="button"
                        onClick={() => router.push(`/trips/${trip._id}`)}
                        className="text-xs md:text-sm rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition"
                    >
                        Back
                    </button>
                </header>

                <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-4 md:p-5">
                    {state.errors?._form && state.errors._form.length > 0 && (
                        <div className="mb-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
                            {state.errors._form.map((e, idx) => (
                                <div key={idx}>{e}</div>
                            ))}
                        </div>
                    )}

                    <form action={formAction} className="space-y-3 text-xs md:text-sm">
                        <input type="hidden" name="tripId" value={trip._id} />
                        <input type="hidden" name="coverImage" value={coverData} />

                        <div>
                            <label className="block mb-1 font-medium">Title</label>
                            <input
                                name="title"
                                type="text"
                                defaultValue={trip.title}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block mb-1 font-medium">Start date</label>
                                <input
                                    name="startDate"
                                    type="date"
                                    defaultValue={trip.startDate?.slice(0, 10)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">End date</label>
                                <input
                                    name="endDate"
                                    type="date"
                                    defaultValue={trip.endDate?.slice(0, 10)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                        </div>

                        {/* Trip Cities Input */}
                        <TripCitiesInput
                            initialCities={trip.cities?.map((c: any) => ({
                                id: c._id || c.name,
                                name: c.name,
                                country: c.country || "Unknown"
                            }))}
                            cityErrors={state.errors?.cities}
                        />

                        <div className="flex items-center gap-2">
                            <input
                                id="isPublic"
                                name="isPublic"
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                defaultChecked={trip.isPublic ?? true}
                            />
                            <label htmlFor="isPublic" className="text-xs md:text-sm text-slate-700">
                                Make trip public
                            </label>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Cover image</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                                onChange={handleFileChange}
                            />
                            {coverPreview && (
                                <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 max-h-40">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={coverPreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <p className="mt-1 text-[11px] text-slate-500">
                                Optional. A nice photo will be shown on the trip header and cards.
                            </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-[11px] font-medium text-slate-700 mb-1">
                                What is public when this trip is shared?
                            </p>
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-[11px] text-slate-700">
                                    <input
                                        id="privacy_showCities"
                                        name="privacy_showCities"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                        defaultChecked={showCities}
                                    />
                                    Show cities and countries
                                </label>
                                <label className="flex items-center gap-2 text-[11px] text-slate-700">
                                    <input
                                        id="privacy_showExpenses"
                                        name="privacy_showExpenses"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                        defaultChecked={showExpenses}
                                    />
                                    Show expenses summary
                                </label>
                                <label className="flex items-center gap-2 text-[11px] text-slate-700">
                                    <input
                                        id="privacy_showItinerary"
                                        name="privacy_showItinerary"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                        defaultChecked={showItinerary}
                                    />
                                    Show itinerary and notes
                                </label>
                                <label className="flex items-center gap-2 text-[11px] text-slate-700">
                                    <input
                                        id="privacy_showCover"
                                        name="privacy_showCover"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                        defaultChecked={showCover}
                                    />
                                    Show cover image
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full mt-3 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/30 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                            {isPending ? "Saving..." : "Save changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}