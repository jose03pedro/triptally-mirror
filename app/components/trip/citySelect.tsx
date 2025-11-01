"use client";

import { useState } from "react";

interface City {
    name: string;
    country: string;
    id: string;
}

interface CitySelectProps {
    availableCities: City[];
    selectedCity: City;
    setSelectedCity: (city: City) => void;
    setSearchTerm: (term: string) => void;
}

export function CitySelect({ availableCities, selectedCity, setSelectedCity, setSearchTerm }: CitySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Filter cities based on search input
    const filteredCities = availableCities.filter((city) =>
        city.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (city: City) => {
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
                value={selectedCity?.name || ""}
                onClick={toggleDropdown}
                readOnly={true}
            />
            <input
                type="hidden"
                name="cities"
                value={JSON.stringify(selectedCity)}
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
                        onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
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
                                    <span className="text-muted dropdown-item text-end px-0" style={{fontSize: "12px", width:"fit-content"}}>{city.country}</span>
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
