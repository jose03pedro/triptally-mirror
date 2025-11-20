"use client";

import { TravelerProfileButton } from "./travelerButton";

interface TravelerCardProps {
  travelerProfile: any;
  onProfileUpdate: (data: any) => void;
}

export function TravelerCard({
  travelerProfile,
  onProfileUpdate,
}: TravelerCardProps) {
  if (!travelerProfile) {
    return (
      <div className="text-center">
        <h5 className="text-muted mb-3">
          You haven't created a traveler profile yet.
        </h5>
        <p className="text-secondary small mb-4">
          Create a profile to get personalized trip recommendations.
        </p>
        <TravelerProfileButton
          label="Create Traveler Profile"
          onProfileUpdate={onProfileUpdate}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "380px" }}>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1 fw-bold text-primary">Traveler Profile</h5>
          <p className="text-muted small mb-0">
            Your preferences and travel style
          </p>
        </div>
      </div>

      {/* Key Stats Row */}
      <div className="row g-2 mb-3">
        <div className="col-4">
          <div className="p-2 bg-light rounded-3">
            <small
              className="text-uppercase text-secondary fw-bold"
              style={{ fontSize: "0.65rem" }}
            >
              Trip Style
            </small>
            <div className="fw-semibold text-dark mt-1 text-capitalize">
              {travelerProfile.tripStyle || "Not set"}
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="p-2 bg-light rounded-3">
            <small
              className="text-uppercase text-secondary fw-bold"
              style={{ fontSize: "0.65rem" }}
            >
              Budget
            </small>
            <div className="fw-semibold text-dark mt-1 text-capitalize">
              {travelerProfile.budgetRange || "Not set"}
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="p-2 bg-light rounded-3">
            <small
              className="text-uppercase text-secondary fw-bold"
              style={{ fontSize: "0.65rem" }}
            >
              Frequency
            </small>
            <div className="fw-semibold text-dark mt-1 text-capitalize">
              {travelerProfile.travelFrequency?.replace(/_/g, " ") || "Not set"}
            </div>
          </div>
        </div>
      </div>

      <hr className="text-muted opacity-25 my-3" />

      <div className="row g-3">
        {/* Interests */}
        <div className="col-12">
          <h6 className="fw-bold mb-1 text-secondary small">Interests</h6>
          <div className="d-flex flex-wrap gap-1">
            {travelerProfile.interests?.length > 0 ? (
              travelerProfile.interests.map((item: string, i: number) => (
                <span
                  key={i}
                  className="badge bg-primary-subtle text-primary-emphasis rounded-pill px-2 py-1"
                  style={{ fontSize: "0.75rem" }}
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-muted small fst-italic">No interests</span>
            )}
          </div>
        </div>

        {/* Transport */}
        <div className="col-12">
          <h6 className="fw-bold mb-1 text-secondary small">
            Preferred Transport
          </h6>
          <div className="d-flex flex-wrap gap-1">
            {travelerProfile.preferredTransport?.length > 0 ? (
              travelerProfile.preferredTransport.map(
                (item: string, i: number) => (
                  <span
                    key={i}
                    className="badge bg-secondary-subtle text-secondary-emphasis px-2 py-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {item}
                  </span>
                )
              )
            ) : (
              <span className="text-muted small fst-italic">None selected</span>
            )}
          </div>
        </div>

        {/* Languages */}
        <div className="col-12">
          <h6 className="fw-bold mb-1 text-secondary small">
            Languages Spoken
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {travelerProfile.languagesSpoken?.length > 0 ? (
              travelerProfile.languagesSpoken.map((item: string, i: number) => (
                <span
                  key={i}
                  className="badge border text-dark fw-normal px-2 py-1"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-muted small fst-italic">None</span>
            )}
          </div>
        </div>

        {/* Diet */}
        <div className="col-12">
          <h6 className="fw-bold mb-1 text-secondary small">
            Dietary Restrictions
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {travelerProfile.dietaryRestrictions?.length > 0 ? (
              travelerProfile.dietaryRestrictions.map(
                (item: string, i: number) => (
                  <span
                    key={i}
                    className="badge bg-danger-subtle text-danger-emphasis px-2 py-1"
                  >
                    {item}
                  </span>
                )
              )
            ) : (
              <span className="text-muted small fst-italic">None</span>
            )}
          </div>
        </div>

        {/* Notes / Mobility */}
        {(travelerProfile.notes || travelerProfile.mobilityNeeds) && (
          <div className="col-12">
            <div className="p-2 border rounded-3 bg-light-subtle">
              {travelerProfile.mobilityNeeds && (
                <div className="mb-1 small">
                  <strong className="text-dark">Mobility Needs:</strong>{" "}
                  <span className="text-secondary">
                    {travelerProfile.mobilityNeeds}
                  </span>
                </div>
              )}
              {travelerProfile.notes && (
                <div className="small">
                  <strong className="text-dark">Notes:</strong>{" "}
                  <span className="text-secondary">
                    {travelerProfile.notes}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-center">
        <TravelerProfileButton
          label="Edit Traveler Profile"
          initialData={travelerProfile}
          onProfileUpdate={onProfileUpdate}
        />
      </div>
    </div>
  );
}
