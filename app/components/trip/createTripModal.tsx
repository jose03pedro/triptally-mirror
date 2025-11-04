import {createTrip} from "@/app/actions/createTrip";
import TripDateRangePicker from "@/app/components/trip/tripDateRangePicker";
import {CloseBtn} from "@/app/components/ui/closeBtn";
import TripCitiesInput from "@/app/components/trip/tripCitiesInput";
import {useActionState, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import FieldErrors from "@/app/components/ui/fieldErrors";
import {Modal} from "react-aria-components";

export default function CreateTripModal() {
    const router = useRouter();

    const initialState = {
        success: false,
        id: null,
        errors: { title: [], startDate: [], endDate: [], cities: [] }
    }

    const initialFormValues = { title: "", startDate: "", endDate: "", cities: [] };

    const [state, action, isPending] = useActionState(createTrip, initialState);
    const [formValues, setFormValues] = useState(initialFormValues);

    useEffect(() => {
        if (state?.success && state?.id) {
            // remove leftover modal backdrop and body class
            document.body.classList.remove("modal-open");
            document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());

            // navigate to the trip
            router.push(`/trips/${state.id}`);
        }
    }, [state, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    }

    const handleCancel = () => {
        setFormValues({title: "", startDate: "", endDate: "", cities: []});
    }

    return (
        <div className="modal fade"
             id="createTripModal"
             role="dialog"
             aria-labelledby="createTripModalLabel"
             aria-hidden="true"
             data-bs-backdrop="static"
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title fs-6" id="createTripModalLabel">Create new trip</h5>
                        <div data-bs-dismiss="modal" aria-label="Close"><CloseBtn /></div>
                    </div>

                    <form id="createTripModalForm" action={action}>
                        <div className="modal-body">
                            <div className="mb-2">
                                <label htmlFor="title" className="form-label text-secondary mb-0">
                                    Title
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    placeholder="Give your trip a title..."
                                    className={`form-control fs-6 ${ state?.errors?.title?.length ? "is-invalid" : "" }`}
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
                            <TripCitiesInput cityErrors={state?.errors?.cities}/>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn " data-bs-dismiss="modal" onClick={handleCancel}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isPending}>Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}