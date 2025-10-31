"use client";

export default function TripDateRangePicker() {
    return (
            <div className="row mb-2">
                <div className="col">
                    <label htmlFor="start-date" className="form-label text-secondary mb-0">
                        Start date
                    </label>
                    <input
                        id="start-date"
                        name="start-date"
                        type="date"
                        className={`form-control fs-6`}
                    />
                </div>
                <div className="col">
                    <label htmlFor="end-date" className="form-label text-secondary mb-0">
                        End date
                    </label>
                    <input
                        id="end-date"
                        name="end-date"
                        type="date"
                        className={`form-control fs-6`}
                    />
                </div>
            </div>
    );
}
