"use client";

import { CloseBtn } from "@/app/components/ui/closeBtn";
import { useState } from "react";
import FieldErrors from "@/app/components/ui/fieldErrors";

declare const bootstrap: any;

interface SearchFlightModalProps {
  tripId: string;
  onFlightAdded?: (flight: any) => void;
}

export function SearchFlightModal({
  tripId,
  onFlightAdded,
}: SearchFlightModalProps) {
  const [flightNumber, setFlightNumber] = useState("");
  const [date, setDate] = useState("");
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!flightNumber || !date) return;
    setError(null);
    setSearching(true);
    setResult(null);
    try {
      const params = new URLSearchParams({ num: flightNumber, date });
      const res = await fetch(`/api/flights?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Search failed");
      setResult(json);
    } catch (e: any) {
      setError(e.message || "Failed to search");
    } finally {
      setSearching(false);
    }
  }

  async function handleAddToTrip() {
    if (!result?.data) return;
    const primary = Array.isArray(result.data) ? result.data[0] : result.data;
    const payload = {
      flightNumber: (
        primary?.flightNumber ||
        primary?.number ||
        flightNumber
      )
        .toString()
        .replace(/\s+/g, ""),
      date,
    };
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/flights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to add flight");

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("searchFlightModal")
      );
      modal?.hide();

      // Reset form
      setFlightNumber("");
      setDate("");
      setResult(null);

      // Callback
      if (onFlightAdded) {
        onFlightAdded(json);
      }
    } catch (e: any) {
      setError(e.message || "Failed to add flight");
    } finally {
      setAdding(false);
    }
  }

  function handleClose() {
    setFlightNumber("");
    setDate("");
    setResult(null);
    setError(null);
  }

  return (
    <div
      className="modal fade"
      id="searchFlightModal"
      role="dialog"
      aria-labelledby="searchFlightModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fs-6" id="searchFlightModalLabel">
              Search & Add Flight
            </h5>
            <div
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleClose}
              style={{ cursor: "pointer" }}
            >
              <CloseBtn />
            </div>
          </div>

          <div className="modal-body">
            {/* Search form */}
            <div className="row g-2 mb-3">
              <div className="col-md-5">
                <label htmlFor="flightNumber" className="form-label text-secondary mb-0">
                  Flight Number
                </label>
                <input
                  id="flightNumber"
                  type="text"
                  className="form-control fs-6"
                  placeholder="e.g. KL1846"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="flightDate" className="form-label text-secondary mb-0">
                  Date
                </label>
                <input
                  id="flightDate"
                  type="date"
                  className="form-control fs-6"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-outline-primary w-100"
                  onClick={handleSearch}
                  disabled={searching || !flightNumber || !date}
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {error && <FieldErrors errors={[error]} />}

            {/* Search results */}
            {result?.data && (
              <div className="border rounded p-3 bg-light">
                <p className="text-muted small mb-2">
                  Source: {result.source === "cache" ? "Cached" : "Live API"}
                </p>
                {Array.isArray(result.data) ? (
                  <div className="list-group">
                    {result.data.slice(0, 5).map((f: any, idx: number) => (
                      <div
                        key={idx}
                        className="list-group-item list-group-item-action"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-semibold">
                              {f.airline?.name} · {f.number || f.flightNumber}
                            </div>
                            <div className="text-muted small">
                              {f.departure?.airport?.name ||
                                f.departure?.airport?.iata ||
                                "Unknown"}{" "}
                              →{" "}
                              {f.arrival?.airport?.name ||
                                f.arrival?.airport?.iata ||
                                "Unknown"}
                            </div>
                            <div className="text-muted small">
                              {f.departure?.scheduledTimeLocal ||
                                f.departure?.scheduledTimeUtc ||
                                "N/A"}
                            </div>
                          </div>
                          <span
                            className={`badge ${
                              f.status === "Arrived"
                                ? "bg-success"
                                : f.status === "Cancelled"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            {f.status || "Unknown"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="list-group-item">
                    <div className="fw-semibold">
                      {result.data.airline?.name} ·{" "}
                      {result.data.number || result.data.flightNumber}
                    </div>
                    <div className="text-muted small">
                      {result.data.departure?.airport?.name ||
                        result.data.departure?.airport?.iata ||
                        "Unknown"}{" "}
                      →{" "}
                      {result.data.arrival?.airport?.name ||
                        result.data.arrival?.airport?.iata ||
                        "Unknown"}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn"
              data-bs-dismiss="modal"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddToTrip}
              disabled={adding || !result?.data}
            >
              {adding ? "Adding..." : "Add to Trip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
