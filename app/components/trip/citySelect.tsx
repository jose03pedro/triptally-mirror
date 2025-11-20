"use client";

import { useState, useEffect, useRef } from "react";
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
    const [showCountryPrompt, setShowCountryPrompt] = useState(false);
    const [customCountry, setCustomCountry] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            ? availableCities?.filter((city) =>
                city.name.toLowerCase().includes(search.toLowerCase())
            )
            : [];

    const handleSelect = (city: City) => {
        setSelectedCity(city);
        setIsOpen(false);
        setSearch("");
        setAvailableCities([]);
    };

    const handleSelectWithCountry = (cityName: string, country: string) => {
        const city: City = { id: cityName, name: cityName, country: country || "Unknown" };
        setSelectedCity(city);
        setIsOpen(false);
        setSearch("");
        setAvailableCities([]);
        setShowCountryPrompt(false);
        setCustomCountry("");
    };

    return (
        <div ref={dropdownRef} className="relative w-full min-w-[200px]">
            <input
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer bg-white text-slate-700"
                placeholder="Select a city..."
                value={selectedCity?.name || ""}
                onClick={toggleDropdown}
                readOnly
            />
            {selectedCity?.name && (
                <input type="hidden" name="cities" value={JSON.stringify(selectedCity)} />
            )}


            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-100 bg-white shadow-xl p-2 max-h-[250px] overflow-y-auto">
                    <input
                        type="text"
                        className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-2"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />

                    {filteredCities.length > 0 ? (
                        <div className="space-y-1">
                            {filteredCities.map((city) => (
                                <button
                                    key={city.id}
                                    type="button"
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 text-sm flex items-center justify-between gap-2 transition"
                                    onClick={() => handleSelect(city)}
                                >
                                    <span className="font-medium text-slate-700">{city.name}</span>
                                    <span className="text-xs text-slate-500 truncate max-w-[100px]">{city.country}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        search.length > 0 && (
                            <>
                                <div className="px-3 py-2 text-xs text-slate-500">No cities found</div>
                                {!showCountryPrompt ? (
                                    <div className="flex flex-col px-1 mt-1">
                                        <button
                                            type="button"
                                            className="w-full text-left px-2 py-1.5 rounded-md text-blue-600 hover:bg-blue-50 text-sm font-medium transition"
                                            onClick={() => setShowCountryPrompt(true)}
                                        >
                                            Use "{search}" as city
                                        </button>
                                        <p className="px-2 text-[10px] text-slate-400 mt-1">You can manually add a country.</p>
                                    </div>
                                ) : (
                                    <div className="px-1 mt-2 p-2 bg-slate-50 rounded-md border border-slate-100">
                                        <input
                                            type="text"
                                            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="Country (optional)"
                                            value={customCountry}
                                            onChange={(e) => setCustomCountry(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="flex-1 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-500"
                                                onClick={() => handleSelectWithCountry(search, customCountry)}
                                            >
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 rounded bg-white border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                                onClick={() => { setShowCountryPrompt(false); setCustomCountry(""); }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )
                    )}
                </div>
            )}
        </div>
    );
}