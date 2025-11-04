"use client";

import { useState } from "react";
import { ActionBtn } from "@/app/components/ui/actionBtn";
import { CitySelect } from "@/app/components/trip/citySelect";
import FieldErrors from "@/app/components/ui/fieldErrors";

export interface City {
    id: string;
    name: string;
    country: string;
}

interface TripCity extends City {
    search: string;
    availableCities: City[];
}

interface TripCitiesInputProps {
    cityErrors?: string[];
}

export default function TripCitiesInput({cityErrors} : TripCitiesInputProps) {
    const [cities, setCities] = useState<TripCity[]>([
        { id: "", name: "", country: "", search: "", availableCities: [] },
    ]);

    const addCity = () =>
        setCities([
            ...cities,
            { id: "", name: "", country: "", search: "", availableCities: [] },
        ]);

    const removeCity = (idx: number) =>
        setCities(cities.filter((_, i) => i !== idx));

    const updateCity = (idx: number, updatedCity: Partial<TripCity>) => {
        setCities((prev) => {
            const newCities = [...prev];
            newCities[idx] = { ...newCities[idx], ...updatedCity };
            return newCities;
        });
    };

    return (
        <div className="mb-3">
            <p className="form-label text-secondary mb-0">Where are you going?</p>
            <div className={`d-flex align-items-center justify-content-between ${cityErrors?.length ? "is-invalid" : ""}`}>
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
                        selectedCity={cityObj}
                        search={cityObj.search}
                        availableCities={cityObj.availableCities}
                        setSearch={(term) => updateCity(idx, { search: term })}
                        setAvailableCities={(list) => updateCity(idx, { availableCities: list })}
                        setSelectedCity={(city) =>
                            updateCity(idx, { ...city, search: "", availableCities: [] })
                        }
                    />

                    {cities.length > 1 && (
                        <div onClick={() => removeCity(idx)} className="ms-2">
                            <ActionBtn size={19} action="delete" />
                        </div>
                    )}
                </div>
            ))}
            <FieldErrors errors={cityErrors} />
        </div>
    );
}



