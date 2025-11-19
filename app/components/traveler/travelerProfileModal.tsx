"use client";

import { useActionState, useState } from "react";
// Assuming the new action file is at "@/app/actions/editTraveler"
import { addTravelerProfile } from "@/app/actions/addTravelerProfile"; 
import ResponsiveModal from "../ui/responsiveModal"; 
import { ChipSelector } from "../ui/chipSelector";

const predefinedTransport = ["Plane", "Train", "Bus", "Car", "Walking", "Bike", "Motorcycle", "Ferry"];
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
}: {
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [otherTransport, setOtherTransport] = useState("");
  const [otherInterests, setOtherInterests] = useState("");
  const [dietaryRestrictionsInput, setDietaryRestrictionsInput] = useState("");
  const [languagesSpokenInput, setLanguagesSpokenInput] = useState("");

  const initialState = {
    success: false,
    errors: {
      message: "",
    }, 
  };
  const [state, action, isPending] = useActionState(addTravelerProfile, initialState);

  const [form, setForm] = useState({
    travelFrequency: "",
    preferredTransport: [],
    accommodationType: "",
    budgetRange: "",
    // foodBudgetRange removed
    dietaryRestrictions: [],
    mobilityNeeds: "",
    interests: [],
    languagesSpoken: [],
    tripStyle: "",
    notes: "",
  });

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, value: string) => {
    setForm((prev) => {
      const currentValues = prev[name as keyof typeof prev] as string[];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [name]: currentValues.filter((v) => v !== value),
        };
      } else {
        return {
          ...prev,
          [name]: [...currentValues, value],
        };
      }
    });
  };

  // Helper to sync all raw string inputs into the main form state arrays
  const syncArrayInputs = () => {
    // Helper to sync comma-separated text input to form array
    const syncTextField = (input: string, formKey: keyof typeof form) => {
      const parsed = input
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x);
      handleChange(formKey, parsed.length > 0 ? parsed : []);
    };

    // Helper to merge predefined checkboxes with "other" text input
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

    syncWithPredefined(otherTransport, "preferredTransport", predefinedTransport);
    syncWithPredefined(otherInterests, "interests", predefinedInterests);
    syncTextField(dietaryRestrictionsInput, "dietaryRestrictions");
    syncTextField(languagesSpokenInput, "languagesSpoken");
  };


  const next = () => {
    syncArrayInputs(); // Sync before moving to the next step
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  const totalSteps = 5;
  
  // Custom submit handler to serialize form state to FormData before sending
  const handleSubmit = () => {
    // Ensure final state sync before submission on the last step
    syncArrayInputs(); 
    
    // Create FormData manually from the React state object
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // For array fields (transport, interests, restrictions, languages), append each item separately
        value.forEach(item => data.append(key, item));
      } else if (value !== null && value !== undefined) {
        // For string fields, append the value
        data.append(key, value.toString());
      }
    });

    // Call the action with the prepared FormData
    action(data);
  };


  return (
    <ResponsiveModal
      id="travelerProfile"
      title="Traveler Profile Setup"
      action={handleSubmit} 
      canSubmit={step === totalSteps}
      onCancel={onClose}
    >
      <div className="mb-3 text-secondary small">
        These questions help TripTally personalize trip recommendations, optimize
        routing, and adjust accessibility or dietary considerations for your
        journeys.
      </div>

      {/* Step 1: Travel Frequency & Style */}
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

      {/* Step 2: Transportation & Accommodation */}
      {step === 2 && (
        <div>
          <h6 className="fw-bold mb-2">Transportation & Accommodation</h6>

          {/* Transportation using ChipSelector */}
          <ChipSelector
            label="Preferred transportation (Select all that apply)"
            options={predefinedTransport}
            selectedValues={form.preferredTransport}
            onChange={handleCheckboxChange}
            name="preferredTransport"
          />

          {/* Other Transportation input */}
          <div className="mt-2 mb-3">
            <label className="form-label small">Other transportation (comma-separated)</label>
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

      {/* Step 3: Budget & Food (Dietary Restrictions uses local string state) */}
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

          <label className="form-label">Dietary restrictions (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., vegetarian, gluten-free"
            // Use local string state for value
            value={dietaryRestrictionsInput}
            // Only update local string state on change
            onChange={(e) => setDietaryRestrictionsInput(e.target.value)}
          />
        </div>
      )}

      {/* Step 4: Accessibility & Language (Languages Spoken uses local string state) */}
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

          <label className="form-label">Languages spoken (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., English, Romanian"
            // Use local string state for value
            value={languagesSpokenInput}
            // Only update local string state on change
            onChange={(e) => setLanguagesSpokenInput(e.target.value)}
          />
        </div>
      )}

      {/* Step 5: Interests & Notes - The last page */}
      {step === totalSteps && (
        <div>
          <h6 className="fw-bold mb-2">Interests & Notes</h6>

          {/* Interests using ChipSelector */}
          <ChipSelector
            label="What are your main interests? (Select all that apply)"
            options={predefinedInterests}
            selectedValues={form.interests}
            onChange={handleCheckboxChange}
            name="interests"
          />

          {/* Other Interests input */}
          <div className="mt-2 mb-3">
            <label className="form-label small">Other interests (comma-separated)</label>
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

      {/* Buttons - Next/Back only, Save is handled by canSubmit prop */}
      <div className="d-flex justify-content-between mt-4">
        {step > 1 ? (
          <button type="button" className="btn btn-secondary" onClick={back} disabled={isPending}>
            Back
          </button>
        ) : (
          <div />
        )}

        {step < totalSteps ? (
          <button type="button" className="btn btn-primary" onClick={next} disabled={isPending}>
            Next
          </button>
        ) : null}
      </div>
    </ResponsiveModal>
  );
}