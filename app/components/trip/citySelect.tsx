"use client";

import { useState, useEffect } from "react";
import { City } from "@/app/components/trip/tripCitiesInput";

interface CitySelectProps {
    selectedCity: City;
    search: string;
    availableCities: City[];
    setSearch: (term: string) => void;
    setAvailableCities: (cities: City[]) => void;
    setSelectedCity: (city: City) => void;
}

export function CitySelect({
                               selectedCity,
                               search,
                               availableCities,
                               setSearch,
                               setAvailableCities,
                               setSelectedCity,
                           }: CitySelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Fetch cities whenever search changes
    useEffect(() => {
        if (!search) return setAvailableCities([]);

        const timeout = setTimeout(async () => {
            try {
                const res = await fetch(`/api/cities?namePrefix=${search}`);
                const data = await res.json();
                setAvailableCities(data || []);
            } catch (err) {
                console.error("Error fetching cities:", err);
                setAvailableCities([]);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    const filteredCities =
        search.length > 0
            ? availableCities.filter((city) =>
                city.name.toLowerCase().includes(search.toLowerCase())
            )
            : [];

    const handleSelect = (city: City) => {
        setSelectedCity(city);
        setIsOpen(false);
        setSearch("");
        setAvailableCities([]);
    };

    return (
        <div className="position-relative w-100" style={{ minWidth: "200px" }}>
            <input
                type="text"
                className="form-control w-100"
                placeholder="Select a city..."
                value={selectedCity?.name || ""}
                onClick={toggleDropdown}
                readOnly
            />
            <input type="hidden" name="cities" value={JSON.stringify(selectedCity)} />


            {isOpen && (
                <div
                    className="dropdown-menu show p-2 w-100"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                    <input
                        type="text"
                        className={`form-control ${filteredCities.length > 0 || search.length > 0 ? "mb-2" : ""}`}
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                            <button
                                key={city.id}
                                type="button"
                                className="dropdown-item d-flex align-items-center justify-content-between gap-4"
                                onClick={() => handleSelect(city)}
                            >
                                <span>{city.name}</span>
                                <span className="text-muted" style={{ fontSize: "12px" }}>
                                    {city.country}
                                </span>
                            </button>
                        ))
                    ) : (
                        search.length > 0 && (
                            <span className="dropdown-item text-muted">No cities found</span>
                        )
                    )}
                </div>
            )}
        </div>
    );
}


