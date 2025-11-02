import {createTrip} from "@/app/actions/createTrip";
import TripDateRangePicker from "@/app/components/trip/tripDateRangePicker";
import {CloseBtn} from "@/app/components/ui/closeBtn";
import TripCitiesInput from "@/app/components/trip/tripCitiesInput";
import {useActionState, useEffect} from "react";
import {useRouter} from "next/navigation";

export default function CreateTripModal() {
    const router = useRouter();

    const [state, action, isPending] = useActionState(createTrip, { success: false, id: null });

    useEffect(() => {
        if (state?.success && state?.id) {
            router.push(`/trips/${state.id}`);
        }
    }, [state, router]);

    return (
        <div className="modal fade" id="createTripModal" role="dialog" aria-labelledby="createTripModalLabel"
             aria-hidden="true">
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
                                    className={`form-control fs-6`}
                                />
                            </div>
                            <TripDateRangePicker/>
                            <TripCitiesInput/>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn " data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isPending}>Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}