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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
    const city: City = {
      id: cityName,
      name: cityName,
      country: country || "Unknown",
    };
    setSelectedCity(city);
    setIsOpen(false);
    setSearch("");
    setAvailableCities([]);
    setShowCountryPrompt(false);
    setCustomCountry("");
  };

  return (
    <div
      ref={dropdownRef}
      className="position-relative w-100"
      style={{ minWidth: "200px" }}
    >
      <input
        type="text"
        className="form-control w-100"
        placeholder="Select a city..."
        value={selectedCity?.name || ""}
        onClick={toggleDropdown}
        readOnly
      />
      {selectedCity?.name && (
        <input
          type="hidden"
          name="cities"
          value={JSON.stringify(selectedCity)}
        />
      )}

      {isOpen && (
        <div
          className="dropdown-menu show p-2 w-100"
          style={{ maxHeight: "200px", overflowY: "auto" }}
        >
          <input
            type="text"
            className={`form-control ${
              filteredCities.length > 0 || search.length > 0 ? "mb-2" : ""
            }`}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filteredCities.length > 0
            ? filteredCities.map((city) => (
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
            : search.length > 0 && (
                <>
                  <span className="dropdown-item text-muted">
                    No cities found
                  </span>
                  {!showCountryPrompt ? (
                    <div className="d-flex flex-column">
                      <button
                        type="button"
                        className="dropdown-item btn btn-link text-start"
                        onClick={() => setShowCountryPrompt(true)}
                      >
                        Use "{search}" as city
                      </button>
                      <small className="text-muted px-2">
                        You can provide a country for custom cities.
                      </small>
                    </div>
                  ) : (
                    <div className="px-2">
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Country (optional - defaults to Unknown)"
                        value={customCountry}
                        onChange={(e) => setCustomCountry(e.target.value)}
                      />
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            handleSelectWithCountry(search, customCountry)
                          }
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setShowCountryPrompt(false);
                            setCustomCountry("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
        </div>
      )}
    </div>
  );
}
