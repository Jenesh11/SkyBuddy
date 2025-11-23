import React, { useState, useEffect, useRef } from "react";
import { PersonalityProfile } from "../types";
import { fetchCitySuggestions, CitySuggestion } from "../services/weatherService";

interface SearchBarProps {
  onSearch: (cityOrCoords: string | { lat: number; lon: number }, displayLocationName?: string) => void;
  personality: PersonalityProfile;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, personality, disabled }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 🌙 Detect Night Mode (8PM - 6AM)
  const hour = new Date().getHours();
  const isNight = hour <= 6 || hour >= 18;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const results = await fetchCitySuggestions(query);
      setSuggestions(results);
      setIsLoading(false);
      setShowSuggestions(true);
    }, 300);

    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelectSuggestion = (city: CitySuggestion) => {
    setQuery(`${city.name}, ${city.country}`);
    setShowSuggestions(false);
    onSearch({ lat: city.lat, lon: city.lon }, city.name);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSearch(
          { lat: pos.coords.latitude, lon: pos.coords.longitude },
          "Current Location"
        );
        setQuery("");
      },
      () => alert("Location access denied.")
    );
  };

  return (
    <div
      className={`
        w-full md:max-w-xs relative pointer-events-auto z-50 search-container flex flex-col items-center
        ${isNight ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" : ""}
      `}
    >
      {/* Search Input */}
      <form onSubmit={handleManualSubmit} className="w-full relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search city..."
          disabled={disabled}
          className={`
            w-full px-5 py-3 pr-12 rounded-2xl backdrop-blur-md shadow-lg outline-none transition-all duration-300 
            border border-white/20 ${personality.colors.text}
            ${isNight ? "bg-white/10 text-white placeholder-white/40" : "bg-white/40"}
            focus:bg-white/60 focus:shadow-xl
          `}
        />

        {/* Search Icon */}
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/20 disabled:opacity-50 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${isNight ? "text-white" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Dropdown Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={`
            absolute top-full mt-2 w-full backdrop-blur-xl rounded-2xl shadow-2xl border overflow-hidden 
            animate-fade-in-down z-50
            ${isNight ? "bg-white/10 border-white/20 text-white" : "bg-white/60 border-white/40"}
        `}>
          {suggestions.map((city, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(city)}
              className="w-full text-left px-5 py-3 hover:bg-white/20 transition-colors border-b border-white/10 last:border-0"
            >
              <div className="font-bold text-sm">{city.name}</div>
              <div className="text-xs opacity-70">{city.state}, {city.country}</div>
            </button>
          ))}
        </div>
      )}

      {/* Use My Location */}
      <button
        onClick={handleUseLocation}
        className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm text-xs font-bold
          ${isNight ? "bg-white/10 border-white/30 text-white" : "bg-white/30 border-white/20"}
          hover:bg-white/50 transition-all active:scale-95
        `}
      >
        📍 Use My Location
      </button>
    </div>
  );
};
