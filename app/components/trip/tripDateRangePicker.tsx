"use client";

import FieldErrors from "@/app/components/ui/fieldErrors";

interface TripDateRangePickerProps {
    startDate?: string;
    endDate?: string;
    startDateErrors?: string[];
    endDateErrors?: string[];
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TripDateRangePicker({ startDate, endDate, startDateErrors, endDateErrors, onChange }: TripDateRangePickerProps) {
    return (
            <div className="row mb-2">
                <div className="col">
                    <label htmlFor="startDate" className="form-label text-secondary mb-0">
                        Start date
                    </label>
                    <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        className={`form-control fs-6 ${ startDateErrors?.length ? "is-invalid" : "" }`}
                        value={startDate}
                        onChange={onChange}
                    />
                    <FieldErrors errors={startDateErrors} />
                </div>
                <div className="col">
                    <label htmlFor="endDate" className="form-label text-secondary mb-0">
                        End date
                    </label>
                    <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        className={`form-control fs-6 ${ endDateErrors?.length ? "is-invalid" : "" }`}
                        value={endDate}
                        onChange={onChange}
                    />
                    <FieldErrors errors={ endDateErrors } />
                </div>
            </div>
    );
}
