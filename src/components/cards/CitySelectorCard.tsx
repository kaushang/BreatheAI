/**
 * City Selector Card
 *
 * A row of searchable city selector dropdowns for the Compare Cities page.
 * Features:
 *   - 2–4 city selectors side by side
 *   - Each selector is a searchable dropdown using cities from constants/cities.ts
 *   - "Add City" button to add more selectors (max 4)
 *   - "X" button to remove a selector (min 2)
 *   - Pre-selects "Delhi" and "Mumbai" by default
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { INDIAN_CITIES } from "@/constants/cities";
import { Plus, X, Search, MapPin, ChevronDown } from "lucide-react";

interface CitySelectorCardProps {
  /** Currently selected city names */
  selectedCities: string[];
  /** Called when cities change */
  onChange: (cities: string[]) => void;
  /** Maximum cities allowed */
  maxCities?: number;
  /** Minimum cities required */
  minCities?: number;
}

/** Individual searchable dropdown for a single city slot */
function CityDropdown({
  value,
  onChange,
  onRemove,
  canRemove,
  excludedCities,
}: {
  value: string;
  onChange: (city: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  excludedCities: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = INDIAN_CITIES.filter(
    (city) =>
      !excludedCities.includes(city.name) &&
      (city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.state.toLowerCase().includes(search.toLowerCase())),
  );

  const selectedCity = INDIAN_CITIES.find((c) => c.name === value);

  return (
    <div ref={ref} className="relative flex-1 min-w-[180px]">
      {/* Selected value / trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5 text-sm transition-all duration-200 ${
          isOpen
            ? "border-primary/50 shadow-[0_0_0_3px_rgba(45,170,140,0.08)]"
            : "border-border hover:border-muted-foreground/30"
        }`}
      >
        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <span className="block text-foreground font-medium truncate">
            {value}
          </span>
          {selectedCity && (
            <span className="block text-[10px] text-muted-foreground/60 truncate">
              {selectedCity.state}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground/50 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Remove button */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-muted border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
          title="Remove city"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city or state…"
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground/40"
              autoFocus
            />
          </div>

          {/* City list */}
          <div className="max-h-52 overflow-y-auto">
            {filteredCities.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground/50">
                No cities found
              </div>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => {
                    onChange(city.name);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50 ${
                    city.name === value
                      ? "bg-primary/5 text-primary font-medium"
                      : "text-foreground"
                  }`}
                >
                  <MapPin className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  <span className="flex-1 truncate">{city.name}</span>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0">
                    {city.state}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CitySelectorCard({
  selectedCities,
  onChange,
  maxCities = 4,
  minCities = 2,
}: CitySelectorCardProps) {
  function handleCityChange(index: number, newCity: string) {
    const updated = [...selectedCities];
    updated[index] = newCity;
    onChange(updated);
  }

  function handleRemove(index: number) {
    if (selectedCities.length <= minCities) return;
    const updated = selectedCities.filter((_, i) => i !== index);
    onChange(updated);
  }

  function handleAdd() {
    if (selectedCities.length >= maxCities) return;
    // Pick the first city not already selected
    const available = INDIAN_CITIES.find(
      (c) => !selectedCities.includes(c.name),
    );
    if (available) {
      onChange([...selectedCities, available.name]);
    }
  }

  return (
    <div id="city-selector-card">
      <div className="flex flex-wrap items-start gap-3">
        {selectedCities.map((city, index) => (
          <CityDropdown
            key={`${city}-${index}`}
            value={city}
            onChange={(newCity) => handleCityChange(index, newCity)}
            onRemove={() => handleRemove(index)}
            canRemove={selectedCities.length > minCities}
            excludedCities={selectedCities.filter((_, i) => i !== index)}
          />
        ))}

        {/* Add City button */}
        {selectedCities.length < maxCities && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary hover:bg-primary/[0.03] active:scale-[0.97]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add City
          </button>
        )}
      </div>
    </div>
  );
}
