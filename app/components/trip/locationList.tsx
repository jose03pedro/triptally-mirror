"use client";

import { useState } from "react";
import { Portal } from "../ui/portal";
import {
  MustVisitLocation,
  LocationCategory,
  LocationPriority,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  PRIORITY_LABELS,
} from "@/types/location/types";

interface LocationListProps {
  locations: MustVisitLocation[];
  tripId: string;
  isOwner?: boolean;
  onLocationDeleted?: (locationId: string) => void;
  onLocationUpdated?: (location: MustVisitLocation) => void;
}

export function LocationList({
  locations,
  tripId,
  isOwner = false,
  onLocationDeleted,
  onLocationUpdated,
}: LocationListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmLocation, setConfirmLocation] = useState<MustVisitLocation | null>(null);
  const [editingLocation, setEditingLocation] = useState<MustVisitLocation | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editPriority, setEditPriority] = useState<LocationPriority>(2);
  const [updating, setUpdating] = useState(false);

  async function handleDelete() {
    if (!confirmLocation) return;
    const location = confirmLocation;
    setConfirmLocation(null);
    setDeletingId(location._id);
    try {
      const res = await fetch(`/api/trips/${tripId}/locations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId: location._id }),
      });
      if (res.ok && onLocationDeleted) {
        onLocationDeleted(location._id);
      }
    } catch (e) {
      console.error("Failed to delete location", e);
    } finally {
      setDeletingId(null);
    }
  }

  function openEditModal(location: MustVisitLocation) {
    setEditingLocation(location);
    setEditNotes(location.notes || "");
    setEditPriority(location.priority);
  }

  async function handleUpdate() {
    if (!editingLocation) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/locations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: editingLocation._id,
          notes: editNotes,
          priority: editPriority,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (onLocationUpdated) {
          onLocationUpdated(updated);
        }
        setEditingLocation(null);
      }
    } catch (e) {
      console.error("Failed to update location", e);
    } finally {
      setUpdating(false);
    }
  }

  function getPriorityBadgeClass(priority: LocationPriority): string {
    switch (priority) {
      case 1:
        return "bg-danger";
      case 2:
        return "bg-warning text-dark";
      case 3:
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  }

  function getCategoryBadgeClass(category: LocationCategory): string {
    switch (category) {
      case "restaurant":
        return "bg-success";
      case "museum":
        return "bg-info";
      case "hotel":
        return "bg-primary";
      case "attraction":
        return "bg-purple";
      case "shopping":
        return "bg-pink";
      case "nightlife":
        return "bg-dark";
      default:
        return "bg-secondary";
    }
  }

  if (!locations || locations.length === 0) {
    return (
      <p className="text-muted small">
        No must-visit locations added yet.
        {isOwner && " Add your first location!"}
      </p>
    );
  }

  // Sort by priority (1 first, then 2, then 3)
  const sortedLocations = [...locations].sort((a, b) => a.priority - b.priority);

  return (
    <>
      {/* Delete Confirmation Modal */}
      <Portal>
        {confirmLocation && (
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
                    Remove Location
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setConfirmLocation(null)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-2">
                    Are you sure you want to remove this location from your trip?
                  </p>
                  <div className="bg-light rounded p-3">
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <span className="material-icons" style={{ fontSize: 18 }}>
                        {CATEGORY_ICONS[confirmLocation.category]}
                      </span>
                      {confirmLocation.name}
                    </div>
                    {confirmLocation.address && (
                      <div className="text-muted small">{confirmLocation.address}</div>
                    )}
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setConfirmLocation(null)}
                  >
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete}>
                    <span className="material-icons me-1" style={{ fontSize: 18 }}>
                      delete
                    </span>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Portal>

      {/* Edit Modal */}
      <Portal>
        {editingLocation && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <span className="material-icons">edit</span>
                    Edit Location
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingLocation(null)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <div className="fw-semibold">{editingLocation.name}</div>
                    {editingLocation.address && (
                      <div className="text-muted small">{editingLocation.address}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Priority</label>
                    <div className="btn-group w-100" role="group">
                      {([1, 2, 3] as LocationPriority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`btn ${
                            editPriority === p ? "btn-primary" : "btn-outline-primary"
                          }`}
                          onClick={() => setEditPriority(p)}
                        >
                          {PRIORITY_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add notes about this location..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingLocation(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdate}
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-icons me-1" style={{ fontSize: 18 }}>
                          save
                        </span>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Portal>

      {/* Location List */}
      <div className="list-group">
        {sortedLocations.map((loc) => (
          <div key={loc._id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#f1f5f9",
                  }}
                >
                  <span className="material-icons text-slate-600" style={{ fontSize: 20 }}>
                    {CATEGORY_ICONS[loc.category]}
                  </span>
                </div>
                <div>
                  <div className="fw-semibold">{loc.name}</div>
                  {loc.address && (
                    <div className="text-muted small text-truncate" style={{ maxWidth: 300 }}>
                      {loc.address}
                    </div>
                  )}
                  {loc.notes && (
                    <div className="text-muted small fst-italic mt-1">
                      "{loc.notes}"
                    </div>
                  )}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span
                  className={`badge ${getPriorityBadgeClass(loc.priority)}`}
                  title={PRIORITY_LABELS[loc.priority]}
                >
                  {PRIORITY_LABELS[loc.priority]}
                </span>
                <span
                  className="badge bg-light text-dark border"
                  title={CATEGORY_LABELS[loc.category]}
                >
                  {CATEGORY_LABELS[loc.category]}
                </span>
                {isOwner && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => openEditModal(loc)}
                      title="Edit location"
                    >
                      <span className="material-icons" style={{ fontSize: 16 }}>
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setConfirmLocation(loc)}
                      disabled={deletingId === loc._id}
                      title="Remove location"
                    >
                      {deletingId === loc._id ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        <span className="material-icons" style={{ fontSize: 16 }}>
                          delete
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
