"use client";

import { useActionState, useEffect, useState } from "react";
import { addTravelerProfile } from "@/app/actions/addTravelerProfile";
import ResponsiveModal from "../ui/responsiveModal";
import { ChipSelector } from "../ui/chipSelector";
import { SuccessStep } from "./succesStep";
import { getTravelerProfile } from "@/app/api/traveler/route";

const predefinedTransport = [
  "Plane",
  "Train",
  "Bus",
  "Car",
  "Walking",
  "Bike",
  "Motorcycle",
  "Ferry",
];
const predefinedInterests = [
  "History & Culture",
  "Food & Drink",
  "Nature & Outdoors",
  "Adventure Sports",
  "Art & Museums",
  "Nightlife",
  "Shopping",
  "Wellness & Spa",
];

export default function TravelerProfileModal({
  onClose,
  initialData,
  onProfileUpdate,
}: {
  onClose: () => void;
  initialData?: any; // <--- Type could be stricter, but 'any' works for the serialized DB object
  onProfileUpdate?: (data: any) => void;
}) {
  const [step, setStep] = useState(1);

  // Helper to extract values that are NOT in the predefined lists (for the "Other" inputs)
  const getOtherValues = (allValues: string[] = [], predefined: string[]) => {
    return allValues.filter((v) => !predefined.includes(v)).join(", ");
  };

  // Initialize "Other" inputs based on initialData
  const [otherTransport, setOtherTransport] = useState(
    getOtherValues(initialData?.preferredTransport, predefinedTransport)
  );
  const [otherInterests, setOtherInterests] = useState(
    getOtherValues(initialData?.interests, predefinedInterests)
  );

  // Initialize text inputs for arrays (comma-separated)
  const [dietaryRestrictionsInput, setDietaryRestrictionsInput] = useState(
    initialData?.dietaryRestrictions?.join(", ") || ""
  );
  const [languagesSpokenInput, setLanguagesSpokenInput] = useState(
    initialData?.languagesSpoken?.join(", ") || ""
  );

  const initialState = {
    success: false,
    errors: { message: "" },
  };
  const [state, action, isPending] = useActionState(
    addTravelerProfile,
    initialState
  );

  useEffect(() => {
    if (state?.success && onProfileUpdate) {
      // Fetch the latest data from server to ensure client state is in sync
      getTravelerProfile().then((newData) => {
        if (newData) {
          onProfileUpdate(newData);
        }
      });
    }
  }, [state?.success, onProfileUpdate]);

  // Initialize form with initialData or defaults
  const [form, setForm] = useState({
    travelFrequency: initialData?.travelFrequency || "",
    preferredTransport: initialData?.preferredTransport || [],
    accommodationType: initialData?.accommodationType || "",
    budgetRange: initialData?.budgetRange || "",
    dietaryRestrictions: initialData?.dietaryRestrictions || [],
    mobilityNeeds: initialData?.mobilityNeeds || "",
    interests: initialData?.interests || [],
    languagesSpoken: initialData?.languagesSpoken || [],
    tripStyle: initialData?.tripStyle || "",
    notes: initialData?.notes || "",
  });

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, value: string) => {
    setForm((prev) => {
      const currentValues = prev[name as keyof typeof prev] as string[];
      if (currentValues.includes(value)) {
        return { ...prev, [name]: currentValues.filter((v) => v !== value) };
      } else {
        return { ...prev, [name]: [...currentValues, value] };
      }
    });
  };

  const syncArrayInputs = () => {
    const syncTextField = (input: string, formKey: keyof typeof form) => {
      const parsed = input
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x);
      handleChange(formKey, parsed.length > 0 ? parsed : []);
    };

    const syncWithPredefined = (
      otherInput: string,
      formKey: keyof typeof form,
      predefined: string[]
    ) => {
      const selectedPredefined = (form[formKey] as string[]).filter((v) =>
        predefined.includes(v)
      );
      const others = otherInput
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x);
      handleChange(formKey, [...selectedPredefined, ...others]);
    };

    syncWithPredefined(
      otherTransport,
      "preferredTransport",
      predefinedTransport
    );
    syncWithPredefined(otherInterests, "interests", predefinedInterests);
    syncTextField(dietaryRestrictionsInput, "dietaryRestrictions");
    syncTextField(languagesSpokenInput, "languagesSpoken");
  };

  const next = () => {
    syncArrayInputs();
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);
  const totalSteps = 5;

  const handleSubmit = () => {
    syncArrayInputs();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => data.append(key, item));
      } else if (value !== null && value !== undefined) {
        data.append(key, value.toString());
      }
    });
    action(data);
  };

  if (state?.success) {
    return (
      <ResponsiveModal
        id="travelerProfileSuccess"
        title="Success"
        action={() => {}}
        canSubmit={false}
        onCancel={onClose}
        showFooter={false}
      >
        <SuccessStep onClose={onClose} />
      </ResponsiveModal>
    );
  }

  return (
    <ResponsiveModal
      id="travelerProfile"
      title={initialData ? "Edit Traveler Profile" : "Traveler Profile Setup"} // Dynamic title
      action={handleSubmit}
      canSubmit={step === totalSteps}
      onCancel={onClose}
    >
      {/* ...existing JSX for steps... */}
      <div className="mb-3 text-secondary small">
        Help us personalize your travel experience with AI suggestions by answering a few questions about your preferences, needs, and interests.
      </div>

      {step === 1 && (
        <div>
          <h6 className="fw-bold mb-2">Travel Frequency & Style</h6>
          <label className="form-label">How often do you travel?</label>
          <select
            className="form-control mb-3"
            name="travelFrequency"
            value={form.travelFrequency}
            onChange={(e) => handleChange("travelFrequency", e.target.value)}
          >
            <option value="">Select</option>
            <option value="rarely">Rarely</option>
            <option value="few_times_year">A few times per year</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>

          <label className="form-label">Trip Style</label>
          <select
            className="form-control"
            name="tripStyle"
            value={form.tripStyle}
            onChange={(e) => handleChange("tripStyle", e.target.value)}
          >
            <option value="">Select</option>
            <option value="relaxed">Relaxed</option>
            <option value="adventurous">Adventurous</option>
            <option value="cultural">Cultural</option>
            <option value="family">Family</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
      )}

      {step === 2 && (
        <div>
          <h6 className="fw-bold mb-2">Transportation & Accommodation</h6>
          <ChipSelector
            label="Preferred transportation (Select all that apply)"
            options={predefinedTransport}
            selectedValues={form.preferredTransport}
            onChange={handleCheckboxChange}
            name="preferredTransport"
          />
          <div className="mt-2 mb-3">
            <label className="form-label small">
              Other transportation (comma-separated)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Scooter, Ferry"
              value={otherTransport}
              onChange={(e) => setOtherTransport(e.target.value)}
            />
          </div>
          <label className="form-label">Preferred accommodation type</label>
          <select
            className="form-control"
            name="accommodationType"
            value={form.accommodationType}
            onChange={(e) => handleChange("accommodationType", e.target.value)}
          >
            <option value="">Select</option>
            <option value="budget">Budget</option>
            <option value="mid">Mid-range</option>
            <option value="luxury">Luxury</option>
            <option value="hostel">Hostel</option>
            <option value="bnb">B&B</option>
          </select>
        </div>
      )}

      {step === 3 && (
        <div>
          <h6 className="fw-bold mb-2">Budget & Food</h6>
          <label className="form-label">Typical overall budget range</label>
          <select
            className="form-control mb-3"
            name="budgetRange"
            value={form.budgetRange}
            onChange={(e) => handleChange("budgetRange", e.target.value)}
          >
            <option value="">Select</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <label className="form-label">
            Dietary restrictions (comma-separated)
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., vegetarian, gluten-free"
            value={dietaryRestrictionsInput}
            onChange={(e) => setDietaryRestrictionsInput(e.target.value)}
          />
        </div>
      )}

      {step === 4 && (
        <div>
          <h6 className="fw-bold mb-2">Accessibility & Language</h6>
          <label className="form-label">Mobility or accessibility needs</label>
          <input
            type="text"
            className="form-control mb-3"
            name="mobilityNeeds"
            placeholder="e.g., wheelchair friendly routes, hearing impaired assistance"
            value={form.mobilityNeeds}
            onChange={(e) => handleChange("mobilityNeeds", e.target.value)}
          />
          <label className="form-label">
            Languages spoken (comma-separated)
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., English, Romanian"
            value={languagesSpokenInput}
            onChange={(e) => setLanguagesSpokenInput(e.target.value)}
          />
        </div>
      )}

      {step === totalSteps && (
        <div>
          <h6 className="fw-bold mb-2">Interests & Notes</h6>
          <ChipSelector
            label="What are your main interests? (Select all that apply)"
            options={predefinedInterests}
            selectedValues={form.interests}
            onChange={handleCheckboxChange}
            name="interests"
          />
          <div className="mt-2 mb-3">
            <label className="form-label small">
              Other interests (comma-separated)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Photography, Skiing"
              value={otherInterests}
              onChange={(e) => setOtherInterests(e.target.value)}
            />
          </div>
          <label className="form-label">Additional notes</label>
          <textarea
            className="form-control"
            name="notes"
            placeholder="Anything else we should know?"
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>
      )}

      <div className="d-flex justify-content-between mt-4">
        {step > 1 ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={back}
            disabled={isPending}
          >
            Back
          </button>
        ) : (
          <div />
        )}
        {step < totalSteps ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={next}
            disabled={isPending}
          >
            Next
          </button>
        ) : null}
      </div>
    </ResponsiveModal>
  );
}
