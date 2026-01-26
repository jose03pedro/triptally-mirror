import { createTrip } from "@/app/actions/trip/createTrip";
import TripDateRangePicker from "@/app/components/trip/tripDateRangePicker";
import TripCitiesInput from "@/app/components/trip/tripCitiesInput";
import { useActionState, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import FieldErrors from "@/app/components/ui/fieldErrors";
import FormModal from "@/app/components/ui/formModal";

declare const bootstrap: any;

interface PlanActivity {
  time: string;
  title: string;
  location?: string;
  notes?: string;
  durationMins?: number;
}

interface PlanDay {
  date: string;
  activities: PlanActivity[];
}

interface PlanPreview {
  summary: string;
  days: PlanDay[];
}

// 1. Define the props interface to include onClose
interface CreateTripModalProps {
  onClose: () => void;
}

// 2. Destructure onClose from the props
export default function CreateTripModal({ onClose }: CreateTripModalProps) {
  const router = useRouter();

  const initialState = {
    success: false,
    id: null,
    errors: { title: [], currency: [], startDate: [], endDate: [], cities: [] },
  };

  const initialFormValues = {
    title: "",
    currency: "",
    startDate: "",
    endDate: "",
    cities: [] as { id?: string; name: string; country: string }[],
  };

  const [state, action, isPending] = useActionState(createTrip, initialState);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [selectedCities, setSelectedCities] = useState<{ id?: string; name: string; country: string }[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  
  // AI Preview state
  const [aiPreview, setAiPreview] = useState<PlanPreview | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pace, setPace] = useState<"relaxed" | "moderate" | "fast">("moderate");
  const [showPreview, setShowPreview] = useState(false);

  // Fetch currencies once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currenciesRes = await fetch("/api/currencies");
        const currenciesData = await currenciesRes.json();
        setCurrencies(currenciesData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []); // run once

  // Store preview plan in sessionStorage when trip is created
  useEffect(() => {
    if (state?.success && state?.id) {
      // If we have a preview plan, store it to import after redirect
      if (aiPreview) {
        sessionStorage.setItem(`trip_preview_${state.id}`, JSON.stringify(aiPreview));
      }
      
      if (onClose) onClose();
      router.push(`/trips/${state.id}`);

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("createTripModal")
      );
      modal?.hide();

      setFormValues(initialFormValues);
      setAiPreview(null);
      setShowPreview(false);
    }
  }, [state?.success, state?.id, onClose, router, aiPreview]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCitiesChange = useCallback((cities: { id?: string; name: string; country: string }[]) => {
    console.log("handleCitiesChange called with:", cities);
    setSelectedCities(cities);
    // Clear preview when cities change
    setAiPreview(null);
    setShowPreview(false);
  }, []);

  const generateAiPreview = async () => {
    console.log("generateAiPreview called", { formValues, selectedCities });
    
    if (!formValues.startDate || !formValues.endDate || selectedCities.length === 0) {
      setAiError("Please fill in dates and add at least one destination");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      console.log("Calling API with:", {
        title: formValues.title || "Trip Preview",
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        destinations: selectedCities,
        preferences: { pace },
      });
      
      const response = await fetch("/api/ai/plan/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formValues.title || "Trip Preview",
          startDate: formValues.startDate,
          endDate: formValues.endDate,
          destinations: selectedCities,
          preferences: { pace },
        }),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error("API error:", data);
        throw new Error(data.error || "Failed to generate plan");
      }

      const data = await response.json();
      console.log("API success:", data);
      setAiPreview(data.plan);
      setShowPreview(true);
    } catch (err: any) {
      console.error("generateAiPreview error:", err);
      setAiError(err.message || "Failed to generate plan preview");
    } finally {
      setAiLoading(false);
    }
  };

  const canSubmit = Boolean(
    formValues.title &&
      formValues.currency &&
      formValues.startDate &&
      formValues.endDate &&
      selectedCities.length > 0
  );

  const canGeneratePreview = Boolean(
    formValues.startDate &&
      formValues.endDate &&
      selectedCities.length > 0
  );

  return (
    // 3. Pass onClose to FormModal so the close/cancel buttons work
    <FormModal
      id="createTrip"
      title="Create new trip"
      action={action}
      isPending={isPending}
      canSubmit={canSubmit}
      onClose={onClose}
    >
      <div className="mb-2">
        <label htmlFor="title" className="form-label text-secondary mb-0">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Give your trip a title..."
          className={`form-control fs-6 ${
            state?.errors?.title?.length ? "is-invalid" : ""
          }`}
          value={formValues.title}
          onChange={handleChange}
        />
        <FieldErrors errors={state?.errors?.title} />
      </div>

      <div className="mb-2">
        <label htmlFor="currency" className="form-label text-secondary mb-0">
          Currency
        </label>

        <select
          id="currency"
          name="currency"
          className={`form-control fs-6 ${
            state?.errors?.currency?.length ? "is-invalid" : ""
          }`}
          value={formValues.currency}
          onChange={handleChange}
        >
          <option value="">Select a currency...</option>
          {currencies?.map((currency: any) => (
            <option key={currency._id} value={currency._id}>
              {currency?.symbol}
            </option>
          ))}
        </select>
        <FieldErrors errors={state?.errors?.currency} />
      </div>

      <TripDateRangePicker
        startDate={formValues.startDate}
        endDate={formValues.endDate}
        startDateErrors={state?.errors?.startDate}
        endDateErrors={state?.errors?.endDate}
        onChange={handleChange}
      />
      <div className="mt-4 pt-3 border-top"></div>
      <TripCitiesInput
        cityErrors={state?.errors?.cities}
        onChangeCities={handleCitiesChange}
      />

      {/* AI Plan Preview Section */}
      <div className="mt-4 pt-3 border-top">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <p className="fw-medium text-dark mb-0" style={{ fontSize: "14px" }}>AI Trip Planner</p>
            <p className="text-muted" style={{ fontSize: "13px" }}>Generate a suggested itinerary before creating</p>
          </div>
        </div>

        {/* Pace selector */}
        <div className="mb-2">
          <label className="form-label text-secondary mb-1" style={{ fontSize: "12px" }}>Pace</label>
          <div className="d-flex gap-2">
            {(["relaxed", "moderate", "fast"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPace(p)}
                className={`btn btn-sm ${pace === p ? "btn-primary" : "btn-outline-secondary"}`}
                style={{ fontSize: "11px", textTransform: "capitalize" }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={generateAiPreview}
          disabled={!canGeneratePreview || aiLoading}
          className="btn btn-outline-primary btn-sm w-100 mb-2"
          title={!canGeneratePreview ? "Fill in dates and select at least one destination first" : "Generate AI plan preview"}
        >
          {aiLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Generating...
            </>
          ) : (
            <>✨ Generate AI Plan Preview</>
          )}
        </button>
        
        {/* Help text when button is disabled */}
        {!canGeneratePreview && !aiLoading && (
          <p className="text-muted text-center mb-2" style={{ fontSize: "11px" }}>
            Fill in dates and add a destination to enable AI preview
          </p>
        )}

        {/* Error */}
        {aiError && (
          <div className="alert alert-danger py-2 mb-2" style={{ fontSize: "12px" }}>
            {aiError}
          </div>
        )}

        {/* Preview */}
        {showPreview && aiPreview && (
          <div className="border rounded p-2 bg-light" style={{ maxHeight: "200px", overflowY: "auto" }}>
            <p className="fw-medium mb-2" style={{ fontSize: "12px" }}>{aiPreview.summary}</p>
            {aiPreview.days.slice(0, 3).map((day, idx) => (
              <div key={idx} className="mb-2">
                <p className="text-muted mb-1" style={{ fontSize: "11px" }}>
                  {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </p>
                {day.activities.slice(0, 2).map((act, aIdx) => (
                  <div key={aIdx} className="d-flex gap-2 mb-1" style={{ fontSize: "11px" }}>
                    <span className="text-muted">{act.time}</span>
                    <span>{act.title}</span>
                  </div>
                ))}
                {day.activities.length > 2 && (
                  <p className="text-muted mb-0" style={{ fontSize: "10px" }}>
                    +{day.activities.length - 2} more activities
                  </p>
                )}
              </div>
            ))}
            {aiPreview.days.length > 3 && (
              <p className="text-muted text-center mb-0" style={{ fontSize: "10px" }}>
                +{aiPreview.days.length - 3} more days
              </p>
            )}
            <p className="text-success text-center mb-0 mt-2" style={{ fontSize: "11px" }}>
              ✓ Plan will be imported after trip creation
            </p>
          </div>
        )}
      </div>
    </FormModal>
  );
}
