"use client";

import { useState } from "react";
import { Portal } from "../ui/portal";

interface FlightListProps {
  flights: any[];
  tripId: string;
  isOwner?: boolean;
  onFlightDeleted?: (flightId: string) => void;
}

export function FlightList({ flights, tripId, isOwner = false, onFlightDeleted }: FlightListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmFlight, setConfirmFlight] = useState<any | null>(null);

  async function handleDelete() {
    if (!confirmFlight) return;
    const flight = confirmFlight;
    setConfirmFlight(null);
    setDeletingId(flight._id);
    try {
      const res = await fetch(`/api/trips/${tripId}/flights`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightId: flight._id }),
      });
      if (res.ok && onFlightDeleted) {
        onFlightDeleted(flight._id);
      }
    } catch (e) {
      console.error("Failed to delete flight", e);
    } finally {
      setDeletingId(null);
    }
  }

  if (!flights || flights.length === 0) {
    return (
      <p className="text-muted small">No flights added yet. Add your first flight!</p>
    );
  }

  return (
    <>
      {/* Confirmation Modal */}
      <Portal>
        {confirmFlight && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header border-0">
                  <h5 className="modal-title text-danger d-flex align-items-center gap-2">
                    <span className="material-icons">warning</span>
                    Remove Flight
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setConfirmFlight(null)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-2">Are you sure you want to remove this flight from your trip?</p>
                  <div className="bg-light rounded p-3">
                    <div className="fw-semibold">
                      {confirmFlight.departure?.airport?.name ||
                        confirmFlight.departure?.airport?.iata ||
                        "Unknown"}{" "}
                      →{" "}
                      {confirmFlight.arrival?.airport?.name ||
                        confirmFlight.arrival?.airport?.iata ||
                        "Unknown"}
                    </div>
                    <div className="text-muted small">
                      {confirmFlight.airline?.name} · {confirmFlight.flightNumber || confirmFlight.number}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setConfirmFlight(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    <span className="material-icons me-1" style={{ fontSize: 18 }}>delete</span>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Portal>

      <div className="list-group">
        {flights.map((f: any) => (
          <div
            key={f._id}
            className="list-group-item"
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="fw-semibold">
                  {f.departure?.airport?.name ||
                    f.departure?.airport?.iata ||
                    "Unknown"}{" "}
                  →{" "}
                  {f.arrival?.airport?.name ||
                    f.arrival?.airport?.iata ||
                    "Unknown"}
                </div>
                <div className="text-muted small">
                  {f.airline?.name} · {f.flightNumber || f.number}
                </div>
                <div className="text-muted small">
                  Departs:{" "}
                  {f.departure?.scheduledTimeLocal
                    ? new Date(f.departure.scheduledTimeLocal).toLocaleString()
                    : f.departure?.scheduledTimeUtc
                    ? new Date(f.departure.scheduledTimeUtc).toLocaleString()
                    : "N/A"}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span
                  className={`badge ${
                    f.status === "Arrived"
                      ? "bg-success"
                      : f.status === "Cancelled"
                      ? "bg-danger"
                      : f.status === "Scheduled"
                      ? "bg-info"
                      : "bg-secondary"
                  }`}
                >
                  {f.status || "Unknown"}
                </span>
                {isOwner && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setConfirmFlight(f)}
                    disabled={deletingId === f._id}
                    title="Remove flight"
                  >
                    {deletingId === f._id ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <span className="material-icons" style={{ fontSize: 16 }}>delete</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
