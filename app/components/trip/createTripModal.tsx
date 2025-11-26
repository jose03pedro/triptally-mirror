import { createTrip } from "@/app/actions/trip/createTrip";
import TripDateRangePicker from "@/app/components/trip/tripDateRangePicker";
import TripCitiesInput from "@/app/components/trip/tripCitiesInput";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FieldErrors from "@/app/components/ui/fieldErrors";
import FormModal from "@/app/components/ui/formModal";

declare const bootstrap: any;

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
    cities: [],
  };

  const [state, action, isPending] = useActionState(createTrip, initialState);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [selectedCitiesCount, setSelectedCitiesCount] = useState(0);
  const [currencies, setCurrencies] = useState<any[]>([]);

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

  useEffect(() => {
    console.log(state);
    if (state?.success && state?.id) {
      if (onClose) onClose();

      router.push(`/trips/${state.id}`);

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("createTripModal")
      );
      modal?.hide();

      setFormValues(initialFormValues);
    }
  }, [state?.success, state?.id, onClose, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const canSubmit = Boolean(
    formValues.title &&
      formValues.startDate &&
      formValues.endDate &&
      selectedCitiesCount > 0
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
      <TripCitiesInput
        cityErrors={state?.errors?.cities}
        onChangeCities={(cities) => setSelectedCitiesCount(cities.length)}
      />
    </FormModal>
  );
}
