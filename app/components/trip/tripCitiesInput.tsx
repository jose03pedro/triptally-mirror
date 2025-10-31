"use client";

import { useState } from "react";
import {ActionBtn} from "@/app/components/ui/actionBtn";

export default function TripCitiesInput() {
    const [cities, setCities] = useState<string[]>([""]); // Start with one input

    const handleCityChange = (index: number, value: string) => {
        const updated = [...cities];
        updated[index] = value;
        setCities(updated);
    };

    const addCity = () => {
        setCities([...cities, ""]);
    };

    const removeCity = (index: number) => {
        setCities(cities.filter((_, i) => i !== index));
    };

    return (
        <div className="mb-3">
            <p className="form-label text-secondary mb-0">Where are you going?</p>
            <div className="d-flex align-items-center justify-content-between">
                <small id="citiesHelpBlock" className="form-text text-muted">
                    Select all the cities you are visiting during this trip.
                </small>
                <div onClick={addCity}>
                    <ActionBtn size={20} action="add" />
                </div>
            </div>

            {cities.map((city, idx) => (
                <div key={idx} className="d-flex align-items-center my-1">
                    <input
                        type="text"
                        className="form-control"
                        placeholder='Type a city'
                        value={city}
                        name="cities"
                        onChange={(e) => handleCityChange(idx, e.target.value)}
                    />
                    {cities.length > 1 && (
                        <div onClick={() => removeCity(idx)}>
                            <ActionBtn size={19} action="delete" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

