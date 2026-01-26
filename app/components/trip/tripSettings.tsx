"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Invite {
  _id: string;
  invitedEmail?: string;
  invitedUserId?: { first_name: string; last_name: string; email: string };
  status: "pending" | "accepted" | "revoked";
  createdAt: string;
  expiresAt: string;
}

interface Collaborator {
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
  role: "owner" | "editor" | "viewer";
}

interface TripSettingsProps {
  tripId: string;
  isPublic: boolean;
  publicSlug?: string;
  isOwner: boolean;
  creatorName: string;
}

export function TripSettingsSection({
  tripId,
  isPublic: initialIsPublic,
  publicSlug: initialSlug,
  isOwner,
  creatorName,
}: TripSettingsProps) {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Invite form
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviting, setInviting] = useState(false);

    // Public sharing
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [publicSlug, setPublicSlug] = useState(initialSlug);
    const [toggling, setToggling] = useState(false);

    async function loadData() {
        if (!isOwner) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [invitesRes, collabRes] = await Promise.all([
                fetch(`/api/trips/${tripId}/invites`, {cache: "no-store"}),
                fetch(`/api/trips/${tripId}/collaborators`, {cache: "no-store"}),
            ]);

            if (invitesRes.ok) {
                const data = await invitesRes.json();
                setInvites(data.invites || []);
            }

            if (collabRes.ok) {
                const data = await collabRes.json();
                setCollaborators(data.collaborators || []);
            }
        } catch (err) {
            console.error("Error loading settings:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripId, isOwner]);

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        if (!inviteEmail.trim() || !isOwner) return;

        setInviting(true);
        setError(null);
        try {
            const res = await fetch(`/api/trips/${tripId}/invites`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: inviteEmail.trim()}),
            });

            if (res.ok) {
                const data = await res.json();
                setInvites((prev) => [data.invite, ...prev]);
                setInviteEmail("");
                setShowInviteForm(false);
                setSuccess("Invite sent!");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to send invite");
            }
        } catch (err) {
            console.error("Error sending invite:", err);
            setError("Failed to send invite");
        } finally {
            setInviting(false);
        }
    }

    async function togglePublic() {
        if (!isOwner) return;
        setToggling(true);
        setError(null);

        const newPublicState = !isPublic;
        try {
            const res = await fetch(`/api/trips/${tripId}/sharing`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    isPublic: newPublicState,
                    enableSharing: newPublicState,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setIsPublic(data.trip.isPublic);
                setPublicSlug(data.trip.publicSlug);
                setSuccess(newPublicState ? "Trip is now public!" : "Trip is now private");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update sharing");
            }
        } catch (err) {
            console.error("Error toggling public:", err);
            setError("Failed to update sharing");
        } finally {
            setToggling(false);
        }
    }

    function copyPublicUrl() {
        if (!publicSlug) return;
        const url = `${window.location.origin}/trips/public/${publicSlug}`;
        navigator.clipboard.writeText(url);
        setSuccess("URL copied to clipboard!");
    }

    // Clear success after 3s
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    return (
        <div className="card shadow-sm border p-3 p-md-4 mb-4">
            {/* Trip Visibility */}
            <div className="mb-4">
                <h3 className="fs-6 fw-semibold text-dark mb-2">
                    Trip visibility
                </h3>

                <p className="small text-secondary mb-2">
                    This is a {isPublic ? "public" : "private"} trip created by{" "}
                    <span className="fw-medium">{creatorName}</span>.
                </p>

                {isOwner && (
                    <div className="d-flex align-items-center gap-3 mt-3">
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="publicToggle"
                                checked={isPublic}
                                onChange={togglePublic}
                                disabled={toggling}
                            />
                            <label className="form-check-label" htmlFor="publicToggle">
                                {toggling ? "Updating..." : isPublic ? "Public" : "Private"}
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Collaborators Section - Owner Only */}
            {isOwner && (
                <div className="pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h3 className="fs-6 fw-semibold text-dark mb-0">
                            Collaborators
                        </h3>

                        <button
                            onClick={() => setShowInviteForm(!showInviteForm)}
                            className="btn btn-sm btn-outline-primary"
                        >
                            + Invite
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-danger py-2 mb-2 d-flex justify-content-between align-items-center">
                            <small>{error}</small>
                            <button
                                type="button"
                                className="btn-close btn-close-sm"
                                onClick={() => setError(null)}
                            />
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success py-2 mb-2">
                            <small>{success}</small>
                        </div>
                    )}

                    {/* Invite Form */}
                    {showInviteForm && (
                        <form
                            onSubmit={handleInvite}
                            className="card card-body bg-light mb-3 p-2"
                        >
                            <div className="d-flex gap-2">
                                <input
                                    type="email"
                                    className="form-control form-control-sm"
                                    placeholder="Email address"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="btn btn-sm btn-primary"
                                    disabled={inviting || !inviteEmail.trim()}
                                >
                                    {inviting ? "..." : "Send"}
                                </button>
                            </div>
                        </form>
                    )}

                    {loading ? (
                        <p className="small text-muted">Loading...</p>
                    ) : (
                        <>
                            {/* Pending Invites */}
                            {invites.filter((i) => i.status === "pending").length > 0 && (
                                <div className="mb-3">
                                    <p className="small text-muted mb-1">
                                        Pending Invites:
                                    </p>

                                    {invites
                                        .filter((i) => i.status === "pending")
                                        .map((invite) => (
                                            <div
                                                key={invite._id}
                                                className="d-flex justify-content-between align-items-center py-1"
                                            >
                      <span className="small text-secondary">
                        {invite.invitedEmail ||
                            invite.invitedUserId?.email ||
                            "Unknown"}
                      </span>
                                                <span className="badge bg-warning text-dark">
                        pending
                      </span>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Current Collaborators */}
                            <div>
                                <p className="small text-muted mb-1">Team:</p>

                                {collaborators.length === 0 ? (
                                    <p className="small text-muted">
                                        Only you for now.
                                    </p>
                                ) : (
                                    collaborators.map((collab) => (
                                        <div
                                            key={collab.user._id}
                                            className="d-flex justify-content-between align-items-center py-1"
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                {collab.user.avatar ? (
                                                    <img
                                                        src={collab.user.avatar}
                                                        alt=""
                                                        className="rounded-circle"
                                                        style={{width: 24, height: 24}}
                                                    />
                                                ) : (
                                                    <div
                                                        className="rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center"
                                                        style={{width: 24, height: 24, fontSize: 10}}
                                                    >
                                                        {collab.user.first_name?.[0]}
                                                    </div>
                                                )}

                                                <span className="small text-secondary">
                        {collab.user.first_name} {collab.user.last_name}
                      </span>
                                            </div>

                                            <span
                                                className={`badge ${
                                                    collab.role === "owner"
                                                        ? "bg-primary"
                                                        : "bg-secondary"
                                                }`}
                                            >
                      {collab.role}
                    </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Non-owner message */}
            {!isOwner && (
                <p className="small text-muted mt-3">
                    You are viewing a shared version of this trip. Some details may be
                    hidden based on the creator&apos;s privacy settings.
                </p>
            )}
        </div>
    );
}

