"use client";

import { useState } from "react";

interface CitySelectProps {
    availableCities: string[];
    selectedCity: string;
    setSelectedCity: (city: string) => void;
}

export function CitySelect({ availableCities, selectedCity, setSelectedCity }: CitySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Filter cities based on search input
    const filteredCities = availableCities.filter((city) =>
        city.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (city: string) => {
        setSelectedCity(city);
        setIsOpen(false);
        setSearch(""); // reset search
    };

    return (
        <div className="position-relative w-100" style={{ minWidth: "200px" }}>
            <input
                type="text"
                className="form-control w-100"
                placeholder='Select a city...'
                value={selectedCity}
                name="cities"
                onClick={toggleDropdown}
                readOnly={true}
            />

            {isOpen && (
                <div
                    className="dropdown-menu show p-2"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                            <button
                                key={city}
                                type="button"
                                className="dropdown-item"
                                onClick={() => handleSelect(city)}
                            >
                                {city}
                            </button>
                        ))
                    ) : (
                        <span className="dropdown-item text-muted">No cities found</span>
                    )}
                </div>
            )}
        </div>
    );
}
