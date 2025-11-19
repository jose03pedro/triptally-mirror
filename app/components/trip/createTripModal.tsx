import { createTrip } from "@/app/actions/createTrip";
import TripDateRangePicker from "@/app/components/trip/tripDateRangePicker";
import TripCitiesInput from "@/app/components/trip/tripCitiesInput";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FieldErrors from "@/app/components/ui/fieldErrors";
import FormModal from "@/app/components/ui/formModal";

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
        errors: { title: [], startDate: [], endDate: [], cities: [] }
    }

    const initialFormValues = { title: "", startDate: "", endDate: "", cities: [] };

    const [state, action, isPending] = useActionState(createTrip, initialState);
    const [formValues, setFormValues] = useState(initialFormValues);
    const [selectedCitiesCount, setSelectedCitiesCount] = useState(0);

    useEffect(() => {
        if (state?.success && state?.id) {
            // log server action result for development
            console.log("createTrip result:", state);

            // remove leftover modal backdrop and body class
            document.body.classList.remove("modal-open");
            document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());

            // navigate to the trip
            router.push(`/trips/${state.id}`);
        }
    }, [state, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    }

    const canSubmit = Boolean(formValues.title && formValues.startDate && formValues.endDate && selectedCitiesCount > 0);

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
                    className={`form-control fs-6 ${state?.errors?.title?.length ? "is-invalid" : ""}`}
                    onChange={handleChange}
                    value={formValues.title}
                />
                <FieldErrors errors={state?.errors?.title} />
            </div>

            <TripDateRangePicker
                startDate={formValues.startDate}
                endDate={formValues.endDate}
                startDateErrors={state?.errors?.startDate}
                endDateErrors={state?.errors?.endDate}
                onChange={handleChange}
            />
            <TripCitiesInput cityErrors={state?.errors?.cities} onChangeCities={(cities) => setSelectedCitiesCount(cities.length)} />
        </FormModal>
    )
}