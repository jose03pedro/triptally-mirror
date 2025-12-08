"use client";

import { useEffect, useState } from "react";
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
  onChangeCities?: (
    cities: { id?: string; name: string; country: string }[]
  ) => void;
  initialCities?: City[];
}

export default function TripCitiesInput({
  cityErrors,
  onChangeCities,
  initialCities = [],
}: TripCitiesInputProps) {
  const [cities, setCities] = useState<TripCity[]>(() => {
    if (initialCities && initialCities.length > 0) {
      return initialCities.map((c) => ({
        ...c,
        search: "",
        availableCities: [],
      }));
    }
    return [{ id: "", name: "", country: "", search: "", availableCities: [] }];
  });

  const addCity = () =>
    setCities((prev) => [
      ...prev,
      { id: "", name: "", country: "", search: "", availableCities: [] },
    ]);

  const removeCity = (idx: number) =>
    setCities((prev) => prev.filter((_, i) => i !== idx));

  const updateCity = (idx: number, updatedCity: Partial<TripCity>) =>
    setCities((prev) => {
      const newCities = [...prev];
      newCities[idx] = { ...newCities[idx], ...updatedCity };
      return newCities;
    });

  // Use useEffect to notify parent
  useEffect(() => {
    onChangeCities?.(cities.filter((c) => c.name));
  }, [cities, onChangeCities]);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="block font-medium text-slate-900 text-sm mb-0">
            Destinations
          </p>
          <p className="text-[11px] text-slate-500">
            Select the cities you are visiting.
          </p>
        </div>
        <div
          onClick={addCity}
          title="Add another city"
          className="cursor-pointer"
        >
          <ActionBtn size={24} action="add_circle" color="#2563eb" />
        </div>
      </div>

      <div
        className={`space-y-2 ${
          cityErrors?.length
            ? "p-2 border border-red-200 rounded bg-red-50"
            : ""
        }`}
      >
        {cities.map((cityObj, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <CitySelect
              selectedCity={cityObj}
              search={cityObj.search}
              availableCities={cityObj.availableCities}
              setSearch={(term) => updateCity(idx, { search: term })}
              setAvailableCities={(list) =>
                updateCity(idx, { availableCities: list })
              }
              setSelectedCity={(city) =>
                updateCity(idx, { ...city, search: "", availableCities: [] })
              }
            />

            {cities.length > 1 && (
              <div
                onClick={() => removeCity(idx)}
                className="flex-shrink-0 cursor-pointer"
              >
                <ActionBtn size={20} action="delete" color="#ef4444" />
              </div>
            )}
          </div>
        ))}
      </div>
      <FieldErrors errors={cityErrors} />
    </div>
  );
}
