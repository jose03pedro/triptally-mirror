"use client";

import { useState, useEffect } from "react";
import { ActionBtn } from "@/app/components/ui/actionBtn";
import { CitySelect } from "@/app/components/trip/citySelect";

interface TripCity {
    name: string;
    country: string;
    id: string;
}

export default function TripCitiesInput() {
    const [cities, setCities] = useState<TripCity[]>([{ name: "", country: "", id:"" }]);
    const [availableCities, setAvailableCities] = useState<TripCity[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch cities whenever searchTerm changes
    useEffect(() => {
        const fetchCities = async () => {
            if (!searchTerm) return;
            try {
                const res = await fetch(`/api/cities?namePrefix=${searchTerm}`);
                const data = await res.json();
                setAvailableCities(data);
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };

        const timeout = setTimeout(fetchCities, 400); // debounce
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const addCity = () => setCities([...cities, { name: "", country: "", id: "" }]);
    const removeCity = (i: number) => setCities(cities.filter((_, idx) => idx !== i));

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

            {cities.map((cityObj, idx) => (
                <div key={idx} className="d-flex align-items-center my-1">
                    <CitySelect
                        availableCities={availableCities}
                        selectedCity={cityObj}
                        setSelectedCity={(newCity) => {
                            const updated = [...cities];
                            updated[idx] = newCity;
                            setCities(updated);
                        }}
                        setSearchTerm={setSearchTerm}
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



