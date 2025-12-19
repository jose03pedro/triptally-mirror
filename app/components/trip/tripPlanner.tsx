"use client";

import { useEffect, useState } from "react";

interface Activity {
  time: string;
  title: string;
  location?: string;
  notes?: string;
  tags?: string[];
  estimatedDuration?: number;
}

interface PlanDay {
  date: string;
  activities: Activity[];
}

interface Plan {
  _id: string;
  tripId: string;
  version: number;
  status: "draft" | "accepted";
  generatedBy: "ai" | "user";
  days: PlanDay[];
  createdAt: string;
  reason?: string;
  parentPlanId?: string;
}

interface PlanVersion {
  _id: string;
  version: number;
  status: "draft" | "accepted";
  generatedBy: "ai" | "user";
  createdAt: string;
  reason?: string;
  isCurrent: boolean;
}

interface TripPlannerProps {
  tripId: string;
  isOwner: boolean;
}

export function TripPlannerSection({ tripId, isOwner }: TripPlannerProps) {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Recompute state
  const [showRecompute, setShowRecompute] = useState(false);
  const [recomputeReason, setRecomputeReason] = useState<"flight" | "weather">("flight");
  const [recomputing, setRecomputing] = useState(false);
  
  // Edit state
  const [editingActivity, setEditingActivity] = useState<{ dayIdx: number; actIdx: number } | null>(null);
  const [editForm, setEditForm] = useState({ time: "", title: "", location: "", notes: "" });
  
  // Version history
  const [showVersions, setShowVersions] = useState(false);

  async function loadPlan() {
    setLoading(true);
    setError(null);
    try {
      // Get versions first
      const versionsRes = await fetch(`/api/trips/${tripId}/plan/versions`, { cache: "no-store" });
      if (versionsRes.ok) {
        const data = await versionsRes.json();
        setVersions(data.versions || []);
        
        // Find current/accepted plan
        const current = data.versions?.find((v: PlanVersion) => v.isCurrent);
        if (current) {
          const planRes = await fetch(`/api/trips/${tripId}/plan/${current._id}`, { cache: "no-store" });
          if (planRes.ok) {
            const planData = await planRes.json();
            setCurrentPlan(planData.plan);
          }
        } else if (data.versions?.length > 0) {
          // Load latest draft if no current
          const latest = data.versions[0];
          const planRes = await fetch(`/api/trips/${tripId}/plan/${latest._id}`, { cache: "no-store" });
          if (planRes.ok) {
            const planData = await planRes.json();
            setCurrentPlan(planData.plan);
          }
        }
      }
    } catch (err) {
      console.error("Error loading plan:", err);
      setError("Failed to load plan");
    } finally {
      setLoading(false);
    }
  }

  // Check for preview plan from modal
  useEffect(() => {
    const previewKey = `trip_preview_${tripId}`;
    const storedPreview = sessionStorage.getItem(previewKey);
    if (storedPreview) {
      sessionStorage.removeItem(previewKey);
      importPreviewPlan(JSON.parse(storedPreview));
    } else {
      loadPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function importPreviewPlan(plan: any) {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/plan/import-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        setSuccess("AI plan imported successfully!");
        await loadPlan();
      } else {
        await loadPlan();
      }
    } catch (err) {
      console.error("Error importing preview:", err);
      await loadPlan();
    }
  }

  async function handleGenerate() {
    if (!isOwner) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setSuccess("Plan generated successfully!");
        await loadPlan();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to generate plan");
      }
    } catch (err) {
      console.error("Error generating plan:", err);
      setError("Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  }

  async function handleAccept() {
    if (!isOwner || !currentPlan || currentPlan.status === "accepted") return;
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/plan/${currentPlan._id}/accept`, {
        method: "POST",
      });
      if (res.ok) {
        setSuccess("Plan accepted!");
        await loadPlan();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to accept plan");
      }
    } catch (err) {
      console.error("Error accepting plan:", err);
      setError("Failed to accept plan");
    }
  }

  async function handleRecompute() {
    if (!isOwner) return;
    setRecomputing(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/plan/recompute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: recomputeReason, delta: {} }),
      });
      if (res.ok) {
        setSuccess("Plan recomputed! A new draft version was created.");
        setShowRecompute(false);
        await loadPlan();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to recompute plan");
      }
    } catch (err) {
      console.error("Error recomputing plan:", err);
      setError("Failed to recompute plan");
    } finally {
      setRecomputing(false);
    }
  }

  async function handleMakeCurrent(planId: string) {
    if (!isOwner) return;
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/plan/${planId}/make-current`, {
        method: "POST",
      });
      if (res.ok) {
        setSuccess("Plan version restored!");
        setShowVersions(false);
        await loadPlan();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to restore version");
      }
    } catch (err) {
      console.error("Error restoring version:", err);
      setError("Failed to restore version");
    }
  }

  function startEditActivity(dayIdx: number, actIdx: number) {
    if (!currentPlan) return;
    const activity = currentPlan.days[dayIdx].activities[actIdx];
    setEditForm({
      time: activity.time,
      title: activity.title,
      location: activity.location || "",
      notes: activity.notes || "",
    });
    setEditingActivity({ dayIdx, actIdx });
  }

  async function saveEditActivity() {
    if (!editingActivity || !currentPlan || !isOwner) return;
    setError(null);
    try {
      const { dayIdx, actIdx } = editingActivity;
      const dayDate = currentPlan.days[dayIdx].date;
      const res = await fetch(`/api/trips/${tripId}/plan/${currentPlan._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updateActivity: {
            dayDate,
            activityIndex: actIdx,
            activity: editForm,
          },
        }),
      });
      if (res.ok) {
        setEditingActivity(null);
        await loadPlan();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update activity");
      }
    } catch (err) {
      console.error("Error updating activity:", err);
      setError("Failed to update activity");
    }
  }

  async function removeActivity(dayIdx: number, actIdx: number) {
    if (!currentPlan || !isOwner) return;
    setError(null);
    try {
      const dayDate = currentPlan.days[dayIdx].date;
      const res = await fetch(`/api/trips/${tripId}/plan/${currentPlan._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          removeActivity: { dayDate, activityIndex: actIdx },
        }),
      });
      if (res.ok) {
        await loadPlan();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to remove activity");
      }
    } catch (err) {
      console.error("Error removing activity:", err);
      setError("Failed to remove activity");
    }
  }

  // Clear success message after 3s
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-4 md:p-5 shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-sm text-slate-500">Loading planner…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4 md:p-5 shadow-sm">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1">Trip Planner</h2>
          <p className="text-xs text-slate-500 mb-0">
            AI-powered itinerary planning for your trip.
          </p>
        </div>

        {isOwner && (
          <div className="d-flex flex-wrap gap-2">
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="btn btn-sm btn-outline-secondary"
            >
              📋 Versions ({versions.length})
            </button>
            {currentPlan && currentPlan.status === "accepted" && (
              <button
                onClick={() => setShowRecompute(!showRecompute)}
                className="btn btn-sm btn-outline-warning"
              >
                🔄 Recompute
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn btn-sm btn-primary"
            >
              {generating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" />
                  Generating...
                </>
              ) : (
                <>✨ Generate Plan</>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          <small>{error}</small>
          <button type="button" className="btn-close btn-close-sm float-end" onClick={() => setError(null)} />
        </div>
      )}

      {success && (
        <div className="alert alert-success py-2 mb-3" role="alert">
          <small>{success}</small>
        </div>
      )}

      {/* Recompute Panel */}
      {showRecompute && isOwner && (
        <div className="card card-body bg-warning bg-opacity-10 border-warning mb-4">
          <p className="text-sm fw-medium mb-2">Recompute Plan Due To:</p>
          <div className="d-flex gap-2 mb-3">
            <button
              className={`btn btn-sm ${recomputeReason === "flight" ? "btn-warning" : "btn-outline-secondary"}`}
              onClick={() => setRecomputeReason("flight")}
            >
              ✈️ Flight Change
            </button>
            <button
              className={`btn btn-sm ${recomputeReason === "weather" ? "btn-warning" : "btn-outline-secondary"}`}
              onClick={() => setRecomputeReason("weather")}
            >
              🌧️ Weather Change
            </button>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={handleRecompute}
              disabled={recomputing}
              className="btn btn-sm btn-warning"
            >
              {recomputing ? "Recomputing..." : "Recompute Now"}
            </button>
            <button onClick={() => setShowRecompute(false)} className="btn btn-sm btn-outline-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Version History Panel */}
      {showVersions && (
        <div className="card card-body bg-light mb-4">
          <p className="text-sm fw-medium mb-2">Plan Versions</p>
          {versions.length === 0 ? (
            <p className="text-xs text-slate-500">No versions yet.</p>
          ) : (
            <div className="list-group list-group-flush" style={{ maxHeight: "200px", overflowY: "auto" }}>
              {versions.map((v) => (
                <div
                  key={v._id}
                  className={`list-group-item d-flex justify-content-between align-items-center py-2 px-2 ${v.isCurrent ? "bg-primary bg-opacity-10" : ""}`}
                >
                  <div>
                    <span className="text-sm fw-medium">v{v.version}</span>
                    <span className={`badge ms-2 ${v.status === "accepted" ? "bg-success" : "bg-secondary"}`}>
                      {v.status}
                    </span>
                    {v.isCurrent && <span className="badge bg-primary ms-1">current</span>}
                    {v.reason && <span className="text-xs text-muted ms-2">({v.reason})</span>}
                    <br />
                    <span className="text-xs text-muted">
                      {new Date(v.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {isOwner && !v.isCurrent && (
                    <button
                      onClick={() => handleMakeCurrent(v._id)}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Restore
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plan Content */}
      {!currentPlan ? (
        <div className="text-center py-5">
          <div className="text-slate-300 mb-3" style={{ fontSize: "3rem" }}>📅</div>
          <p className="text-sm text-slate-500 mb-2">No plan generated yet.</p>
          {isOwner && (
            <p className="text-xs text-slate-400">
              Click &quot;Generate Plan&quot; to create an AI-powered itinerary.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Status Banner */}
          <div className={`alert ${currentPlan.status === "draft" ? "alert-warning" : "alert-success"} py-2 mb-3`}>
            <div className="d-flex justify-content-between align-items-center">
              <small>
                {currentPlan.status === "draft" ? "📝 Draft Plan" : "✅ Accepted Plan"} (v{currentPlan.version})
              </small>
              {isOwner && currentPlan.status === "draft" && (
                <button onClick={handleAccept} className="btn btn-sm btn-success">
                  Accept Plan
                </button>
              )}
            </div>
          </div>

          {/* Days */}
          <div className="space-y-4">
            {currentPlan.days.map((day, dayIdx) => (
              <div key={dayIdx} className="border rounded p-3 mb-3">
                <h3 className="text-sm fw-semibold text-slate-800 mb-2">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                
                {day.activities.length === 0 ? (
                  <p className="text-xs text-slate-400">No activities planned.</p>
                ) : (
                  <ul className="list-unstyled mb-0">
                    {day.activities.map((act, actIdx) => (
                      <li key={actIdx} className="d-flex gap-3 py-2 border-bottom">
                        {editingActivity?.dayIdx === dayIdx && editingActivity?.actIdx === actIdx ? (
                          <div className="flex-grow-1">
                            <div className="row g-2 mb-2">
                              <div className="col-3">
                                <input
                                  type="time"
                                  className="form-control form-control-sm"
                                  value={editForm.time}
                                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                />
                              </div>
                              <div className="col-9">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Title"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                />
                              </div>
                            </div>
                            <input
                              type="text"
                              className="form-control form-control-sm mb-2"
                              placeholder="Location"
                              value={editForm.location}
                              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            />
                            <textarea
                              className="form-control form-control-sm mb-2"
                              placeholder="Notes"
                              rows={2}
                              value={editForm.notes}
                              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            />
                            <div className="d-flex gap-2">
                              <button onClick={saveEditActivity} className="btn btn-sm btn-primary">Save</button>
                              <button onClick={() => setEditingActivity(null)} className="btn btn-sm btn-outline-secondary">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs text-slate-500" style={{ minWidth: "50px" }}>
                              {act.time}
                            </div>
                            <div className="flex-grow-1">
                              <p className="text-sm fw-medium text-slate-800 mb-0">{act.title}</p>
                              {act.location && (
                                <p className="text-xs text-slate-500 mb-0">📍 {act.location}</p>
                              )}
                              {act.notes && (
                                <p className="text-xs text-slate-400 mb-0">{act.notes}</p>
                              )}
                            </div>
                            {isOwner && (
                              <div className="d-flex gap-1">
                                <button
                                  onClick={() => startEditActivity(dayIdx, actIdx)}
                                  className="btn btn-sm btn-link text-primary p-0"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => removeActivity(dayIdx, actIdx)}
                                  className="btn btn-sm btn-link text-danger p-0"
                                  title="Remove"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

