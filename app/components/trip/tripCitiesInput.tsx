"use client";

import { useState } from "react";
import { ActionBtn } from "@/app/components/ui/actionBtn";
import { CitySelect } from "@/app/components/trip/citySearch";

export default function TripCitiesInput() {
    const [cities, setCities] = useState<string[]>([""]); // Start with one city

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
                    <CitySelect
                        availableCities={["Paris", "Rome", "Berlin", "London", "Madrid"]}
                        selectedCity={city}
                        setSelectedCity={(newCity) => handleCityChange(idx, newCity)}
                    />

                    {cities.length > 1 && (
                        <div onClick={() => removeCity(idx)} className="ms-2">
                            <ActionBtn size={19} action="delete" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}


