import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, History, MapPin, Compass, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDestinationSearch } from '../hooks/useDestinationSearch.js';

export const SearchBar = ({ onSearchSubmit }) => {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    suggestions,
    loading,
    error,
    selectedDestination,
    selectDestination,
    searchHistory,
    clearSearch,
    clearHistory
  } = useDestinationSearch();

  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get('search') || '';
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [window.location.search]);

  // Debounced query URL submission (500ms)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get('search') || '';

    if (!query && urlQuery) {
      params.delete('search');
      navigate(`/tours?${params.toString()}`, { replace: true });
      return;
    }

    if (!query) return;

    const delayDebounce = setTimeout(() => {
      if (query.trim() && query.trim() !== urlQuery) {
        navigate(`/tours?search=${encodeURIComponent(query.trim())}`, { replace: true });
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, navigate]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard navigation keyboard triggers
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIdx((prev) => 
        prev === suggestions.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIdx((prev) => 
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIdx >= 0 && activeSuggestionIdx < suggestions.length) {
        handleSelectSuggestion(suggestions[activeSuggestionIdx]);
      } else if (query.trim()) {
        handleSubmitQuery(query);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveSuggestionIdx(-1);
    }
  };

  const handleSelectSuggestion = (dest) => {
    selectDestination(dest);
    const searchVal = dest.city || dest.country || dest.formattedAddress;
    navigate(`/tours?search=${encodeURIComponent(searchVal)}`);
    setShowDropdown(false);
    setActiveSuggestionIdx(-1);
  };

  const handleSubmitQuery = (q) => {
    navigate(`/tours?search=${encodeURIComponent(q)}`);
    setShowDropdown(false);
    setActiveSuggestionIdx(-1);
  };

  const handleRecentClick = (dest) => {
    selectDestination(dest);
    const searchVal = typeof dest === 'string' ? dest : (dest.city || dest.country || dest.formattedAddress);
    navigate(`/tours?search=${encodeURIComponent(searchVal)}`);
    setShowDropdown(false);
  };

  const handleClear = () => {
    clearSearch();
    if (onSearchSubmit) {
      onSearchSubmit(null);
    }
  };

  // Helper to split and highlight matched suggestion texts
  const renderHighlightedText = (text, highlight) => {
    if (!highlight.trim()) return <span className="text-slate-600">{text}</span>;
    const parts = text.split(new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase()
            ? <strong key={i} className="text-gold-500 font-extrabold">{part}</strong>
            : <span key={i} className="text-slate-500 font-medium">{part}</span>
        )}
      </span>
    );
  };

  const popularDestinations = [
    { city: 'Paris', state: 'Île-de-France', country: 'France', flag: '🇫🇷', formattedAddress: 'Paris, France', latitude: 48.8566, longitude: 2.3522 },
    { city: 'Tokyo', state: 'Tokyo Prefecture', country: 'Japan', flag: '🇯🇵', formattedAddress: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
    { city: 'Dubai', state: 'Dubai Emirate', country: 'United Arab Emirates', flag: '🇦🇪', formattedAddress: 'Dubai, United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
    { city: 'Rome', state: 'Lazio', country: 'Italy', flag: '🇮🇹', formattedAddress: 'Rome, Italy', latitude: 41.9028, longitude: 12.4964 }
  ];

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl font-sans z-35">
      <form onSubmit={(e) => { e.preventDefault(); if (query) handleSubmitQuery(query); }} className="relative">
        <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-gold-500 rounded-2xl shadow-sm transition-all duration-200">
          <span className="pl-4 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Where do you want to escape? Search Paris, Switzerland, Tokyo..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setActiveSuggestionIdx(-1); }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            aria-label="Geocoding destination search autocomplete input"
            className="w-full pl-3 pr-10 py-3.5 bg-transparent border-none text-xs text-slate-700 focus:outline-none placeholder-slate-400 font-semibold"
          />
          {loading && (
            <span className="absolute right-12 w-4 h-4 rounded-full border-2 border-slate-200 border-t-gold-500 animate-spin" />
          )}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown autocompletion panel */}
      <AnimatePresence>
        {showDropdown && (query || searchHistory.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-40 max-h-96 overflow-y-auto"
          >
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-rose-50/50 border-b border-rose-100 text-xs text-rose-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Empty geocoding state */}
            {query && suggestions.length === 0 && !loading && !error && (
              <div className="p-6 text-center text-xs text-slate-400 italic">
                No destinations matched your keyword search. Try searching general countries.
              </div>
            )}

            {/* Auto Suggestions List */}
            {query && suggestions.length > 0 && (
              <div className="py-2.5">
                <span className="block text-[9px] uppercase font-bold text-slate-400 px-4 mb-2 tracking-wider">
                  Destination Suggestions
                </span>
                <div className="divide-y divide-slate-50">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      onMouseEnter={() => setActiveSuggestionIdx(idx)}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${
                        activeSuggestionIdx === idx ? 'bg-slate-50' : 'bg-transparent'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-gold-500/5 text-gold-500 flex items-center justify-center font-bold text-xs shrink-0">
                        {item.flag || <MapPin className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <strong className="text-xs text-slate-800 block truncate font-bold">
                          {renderHighlightedText(item.city || item.formattedAddress?.split(',')?.[0] || 'Location', query)}
                        </strong>
                        <span className="text-[10px] text-slate-400 block truncate font-medium mt-0.5">
                          {item.state ? `${item.state}, ` : ''}{item.country}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular/Recent Destinations history */}
            {!query && (
              <div className="divide-y divide-slate-100">
                {/* Search History list */}
                {searchHistory.length > 0 && (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-slate-400" /> Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={clearHistory}
                        className="text-[10px] text-rose-500 hover:underline font-bold"
                      >
                        Clear History
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleRecentClick(item)}
                          className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-105 text-slate-600 rounded-full text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                        >
                          {item.flag} {item.city || item.country}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Destinations list */}
                <div className="p-4">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2.5">
                    <Compass className="w-3.5 h-3.5 text-slate-400" /> Popular Destinations
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {popularDestinations.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleRecentClick(item)}
                        className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-105 text-slate-600 rounded-full text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                      >
                        {item.flag} {item.city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
