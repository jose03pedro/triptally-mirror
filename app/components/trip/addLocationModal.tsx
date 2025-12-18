"use client";

import { CloseBtn } from "@/app/components/ui/closeBtn";
import { useState, useEffect, useRef } from "react";
import {
  LocationCategory,
  LocationPriority,
  PlacePrediction,
  CATEGORY_LABELS,
  PRIORITY_LABELS,
} from "@/types/location/types";

declare const bootstrap: any;

interface AddLocationModalProps {
  tripId: string;
  onLocationAdded?: (location: any) => void;
}

export function AddLocationModal({
  tripId,
  onLocationAdded,
}: AddLocationModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<LocationCategory>("attraction");
  const [priority, setPriority] = useState<LocationPriority>(2);
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);

  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search for places when Enter is pressed
  async function handleSearch() {
    if (!searchQuery || searchQuery.length < 2 || manualEntry) {
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/places?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok && data.predictions) {
        setPredictions(data.predictions);
        setShowPredictions(true);
      }
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setSearching(false);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  async function handleSelectPlace(prediction: PlacePrediction) {
    setShowPredictions(false);
    setPredictions([]);
    setSearchQuery(prediction.name);
    setName(prediction.name);
    setAddress(prediction.address);
    setPlaceId(prediction.placeId);

    // Determine category from types
    const types = prediction.types || [];
    if (types.includes("restaurant") || types.includes("food")) {
      setCategory("restaurant");
    } else if (types.includes("museum")) {
      setCategory("museum");
    } else if (types.includes("lodging")) {
      setCategory("hotel");
    } else if (types.includes("shopping_mall") || types.includes("store")) {
      setCategory("shopping");
    } else if (types.includes("night_club") || types.includes("bar")) {
      setCategory("nightlife");
    } else {
      setCategory("attraction");
    }

    // Fetch full details for coordinates
    try {
      const res = await fetch(`/api/places?placeId=${prediction.placeId}`);
      const data = await res.json();
      if (res.ok && data.coordinates) {
        setCoordinates(data.coordinates);
      }
    } catch (e) {
      console.error("Error fetching place details:", e);
    }
  }

  async function handleAdd() {
    if (!name.trim()) {
      setError("Please enter a location name");
      return;
    }

    setAdding(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        category,
        priority,
        notes: notes.trim() || undefined,
        address: address.trim() || undefined,
        coordinates: coordinates || undefined,
        placeId: placeId || undefined,
      };

      const res = await fetch(`/api/trips/${tripId}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to add location");

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addLocationModal")
      );
      modal?.hide();

      // Reset form
      handleReset();

      // Callback
      if (onLocationAdded) {
        onLocationAdded(json);
      }
    } catch (e: any) {
      setError(e.message || "Failed to add location");
    } finally {
      setAdding(false);
    }
  }

  function handleReset() {
    setName("");
    setSearchQuery("");
    setCategory("attraction");
    setPriority(2);
    setNotes("");
    setAddress("");
    setCoordinates(null);
    setPlaceId(null);
    setPredictions([]);
    setShowPredictions(false);
    setManualEntry(false);
    setError(null);
  }

  function handleClose() {
    handleReset();
  }

  return (
    <div
      className="modal fade"
      id="addLocationModal"
      role="dialog"
      aria-labelledby="addLocationModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fs-6" id="addLocationModalLabel">
              <span className="material-icons me-2" style={{ fontSize: 20, verticalAlign: "middle" }}>
                add_location
              </span>
              Add Must-Visit Location
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
            {/* Search or Manual Toggle */}
            <div className="mb-3">
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn ${!manualEntry ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setManualEntry(false)}
                >
                  <span className="material-icons me-1" style={{ fontSize: 16 }}>search</span>
                  Search Places
                </button>
                <button
                  type="button"
                  className={`btn ${manualEntry ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setManualEntry(true)}
                >
                  <span className="material-icons me-1" style={{ fontSize: 16 }}>edit</span>
                  Add Manually
                </button>
              </div>
            </div>

            {/* Place Search */}
            {!manualEntry && (
              <div className="mb-3 position-relative">
                <label className="form-label fw-semibold">Search for a place</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <span className="material-icons" style={{ fontSize: 18 }}>search</span>
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="form-control"
                    placeholder="Type and press Enter to search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => predictions.length > 0 && setShowPredictions(true)}
                  />
                  {searching && (
                    <span className="input-group-text">
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    </span>
                  )}
                </div>
                {searchQuery.length > 0 && !showPredictions && !searching && (
                  <small className="text-muted">Press Enter to search</small>
                )}

                {/* Predictions Dropdown */}
                {showPredictions && predictions.length > 0 && (
                  <div
                    className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                    style={{ zIndex: 1050, maxHeight: 250, overflowY: "auto" }}
                  >
                    {predictions.map((p) => (
                      <div
                        key={p.placeId}
                        className="p-2 border-bottom cursor-pointer hover-bg-light"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSelectPlace(p)}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                      >
                        <div className="fw-semibold">{p.name}</div>
                        <div className="text-muted small">{p.address}</div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && !searching && predictions.length === 0 && showPredictions && (
                  <div className="text-muted small mt-2">
                    No places found. Try a different search or{" "}
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0"
                      onClick={() => {
                        setManualEntry(true);
                        setName(searchQuery);
                      }}
                    >
                      add manually
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Manual Name Entry */}
            {manualEntry && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Location Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Pastéis de Belém"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            {/* Show selected place or allow editing */}
            {(name || manualEntry) && (
              <>
                {/* Selected Place Info */}
                {!manualEntry && name && (
                  <div className="alert alert-success d-flex align-items-center mb-3">
                    <span className="material-icons me-2">check_circle</span>
                    <div>
                      <strong>{name}</strong>
                      {address && <div className="small">{address}</div>}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary ms-auto"
                      onClick={() => {
                        setName("");
                        setSearchQuery("");
                        setAddress("");
                        setCoordinates(null);
                        setPlaceId(null);
                      }}
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Category */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as LocationCategory)}
                  >
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Priority</label>
                  <div className="btn-group w-100" role="group">
                    {([1, 2, 3] as LocationPriority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`btn ${priority === p ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setPriority(p)}
                      >
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address (for manual entry) */}
                {manualEntry && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Address (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Notes (optional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="e.g., Try the pastel de nata!"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center">
                <span className="material-icons me-2">error</span>
                {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={adding || !name.trim()}
            >
              {adding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Adding...
                </>
              ) : (
                <>
                  <span className="material-icons me-1" style={{ fontSize: 18 }}>add</span>
                  Add Location
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
