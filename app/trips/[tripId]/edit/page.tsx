"use client";

import { useEffect, useState, useActionState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateTrip } from "@/app/actions/trip/updateTrip";
import { useAuth } from "@/lib/hook/useAuth";
import { Loading } from "@/app/components/ui/loading";
import TripCitiesInput, { City } from "@/app/components/trip/tripCitiesInput";
import { Trip } from "@/types/trip/types";
import { Currency } from "@/types/currency/types";

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
  const [state, formAction, isPending] = useActionState(
    updateTrip,
    initialState
  );

  const [currencies, setCurrencies] = useState<Currency[]>([]);

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

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const currenciesRes = await fetch(`/api/currencies`, {
          cache: "no-store",
        });

        const currenciesData = currenciesRes.ok
          ? await currenciesRes.json()
          : [];

        setCurrencies(currenciesData || []);
      } catch (err) {
        console.error("Error getting currencies:", err);
      }
    }
    fetchCurrencies();
  }, []);

  if (loading) return <Loading />;

  if (!trip) {
    return (
      <div className="pt-24 px-4">
        <p className="text-sm text-slate-500">Trip not found.</p>
      </div>
    );
  }

  const ownerId = trip.owner._id;
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
      <div className="min-vh-100 pt-5 pb-4 px-3">
          <div className="container" style={{ maxWidth: "768px" }}>
              <header className="d-flex align-items-center justify-content-between gap-2 mb-3">
                  <h1 className="fs-4 fs-md-3 fw-semibold text-dark mb-0">
                      Edit trip
                  </h1>

                  <button
                      type="button"
                      onClick={() => router.push(`/trips/${trip._id}`)}
                      className="btn btn-outline-secondary btn-sm rounded-pill"
                  >
                      Back
                  </button>
              </header>

              <div className="card shadow-sm border">
                  <div className="card-body p-3 p-md-4">

                      {state.errors?._form?.length > 0 && (
                          <div className="alert alert-danger py-2 small">
                              {state.errors._form.map((e, idx) => (
                                  <div key={idx}>{e}</div>
                              ))}
                          </div>
                      )}

                      <form action={formAction} className="small">
                          <input type="hidden" name="tripId" value={trip._id} />
                          <input type="hidden" name="coverImage" value={coverData} />

                          {/* Title */}
                          <div className="mb-3">
                              <label className="form-label fw-medium">Title</label>
                              <input
                                  name="title"
                                  type="text"
                                  defaultValue={trip.title}
                                  className="form-control"
                                  required
                              />
                          </div>

                          {/* Dates + Currency */}
                          <div className="row g-3 mb-3">
                              <div className="col-sm-6">
                                  <label className="form-label fw-medium">Start date</label>
                                  <input
                                      name="startDate"
                                      type="date"
                                      defaultValue={trip.startDate?.slice(0, 10)}
                                      className="form-control"
                                      required
                                  />
                              </div>

                              <div className="col-sm-6">
                                  <label className="form-label fw-medium">End date</label>
                                  <input
                                      name="endDate"
                                      type="date"
                                      defaultValue={trip.endDate?.slice(0, 10)}
                                      className="form-control"
                                      required
                                  />
                              </div>

                              <div className="col-sm-6">
                                  <label htmlFor="currency" className="form-label text-secondary mb-0">
                                      Currency
                                  </label>
                                  <select
                                      id="currency"
                                      name="currency"
                                      className={`form-select ${
                                          state?.errors?.currency?.length ? "is-invalid" : ""
                                      }`}
                                      defaultValue={trip.currency?._id}
                                  >
                                      <option value="">Select a currency...</option>
                                      {currencies?.map((currency: any) => (
                                          <option key={currency._id} value={currency._id}>
                                              {currency?.symbol}
                                          </option>
                                      ))}
                                  </select>
                              </div>
                          </div>

                          {/* Trip Cities */}
                          <TripCitiesInput
                              initialCities={trip.cities?.map((c: any) => ({
                                  id: c._id || c.name,
                                  name: c.name,
                                  country: c.country || "Unknown",
                              }))}
                              cityErrors={state.errors?.cities}
                          />

                          {/* Cover image */}
                          <div className="mb-3">
                              <label className="form-label fw-medium">Cover image</label>
                              <input
                                  type="file"
                                  accept="image/*"
                                  className="form-control form-control-sm"
                                  onChange={handleFileChange}
                              />

                              {coverPreview && (
                                  <div
                                      className="mt-2 rounded overflow-hidden border d-flex align-items-center justify-content-center"
                                       style={{ maxHeight: "160px" }}
                                  >
                                      <img
                                          src={coverPreview}
                                          alt="Preview"
                                          className="w-100 h-100 object-fit-cover"
                                      />
                                  </div>
                              )}

                              <div className="form-text">
                                  Optional. A nice photo will be shown on the trip header and cards.
                              </div>
                          </div>

                          {/* Privacy section */}
                          <div className="pt-3 border-top">
                              <p className="fw-medium mb-2">
                                  What is public when this trip is shared?
                              </p>

                              <div className="form-check mb-1">
                                  <input
                                      id="privacy_showCities"
                                      name="privacy_showCities"
                                      type="checkbox"
                                      className="form-check-input"
                                      defaultChecked={showCities}
                                  />
                                  <label className="form-check-label" htmlFor="privacy_showCities">
                                      Show cities and countries
                                  </label>
                              </div>

                              <div className="form-check mb-1">
                                  <input
                                      id="privacy_showExpenses"
                                      name="privacy_showExpenses"
                                      type="checkbox"
                                      className="form-check-input"
                                      defaultChecked={showExpenses}
                                  />
                                  <label className="form-check-label" htmlFor="privacy_showExpenses">
                                      Show expenses summary
                                  </label>
                              </div>

                              <div className="form-check mb-1">
                                  <input
                                      id="privacy_showItinerary"
                                      name="privacy_showItinerary"
                                      type="checkbox"
                                      className="form-check-input"
                                      defaultChecked={showItinerary}
                                  />
                                  <label className="form-check-label" htmlFor="privacy_showItinerary">
                                      Show itinerary and notes
                                  </label>
                              </div>

                              <div className="form-check">
                                  <input
                                      id="privacy_showCover"
                                      name="privacy_showCover"
                                      type="checkbox"
                                      className="form-check-input"
                                      defaultChecked={showCover}
                                  />
                                  <label className="form-check-label" htmlFor="privacy_showCover">
                                      Show cover image
                                  </label>
                              </div>
                          </div>

                          {/* Submit */}
                          <button
                              type="submit"
                              disabled={isPending}
                              className="btn btn-primary w-100 rounded-pill mt-4"
                          >
                              {isPending ? "Saving..." : "Save changes"}
                          </button>
                      </form>
                  </div>
              </div>
          </div>
      </div>

  );
}
