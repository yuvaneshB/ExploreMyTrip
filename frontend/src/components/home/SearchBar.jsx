import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Compass, X, Calendar, ChevronDown, Clock, Sparkles } from 'lucide-react';
import { useDestinationSearch } from '../../hooks/useDestinationSearch.js';

const SearchBar = ({ categories }) => {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    suggestions,
    loading,
    error,
    selectDestination,
    searchHistory,
    clearSearch,
    clearHistory
  } = useDestinationSearch();

  const [selectedDestObj, setSelectedDestObj] = useState(null);
  const [selectedCatObj, setSelectedCatObj] = useState(null);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  const destDropdownRef = useRef(null);
  const catDropdownRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (destDropdownRef.current && !destDropdownRef.current.contains(e.target)) {
        setShowDestDropdown(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setShowCatDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    let path = '/tours?';
    const params = [];
    if (selectedDestObj) {
      params.push(`search=${encodeURIComponent(selectedDestObj.city || selectedDestObj.country || selectedDestObj.formattedAddress)}`);
    } else if (query) {
      params.push(`search=${encodeURIComponent(query)}`);
    }
    if (selectedCatObj) {
      params.push(`category=${selectedCatObj._id}`);
    }
    path += params.join('&');
    navigate(path);
  };

  const handleSelectSuggestion = (dest) => {
    selectDestination(dest);
    setSelectedDestObj(dest);
    setQuery(dest.city || dest.country || dest.formattedAddress);
    setShowDestDropdown(false);
  };

  const handleTrendingClick = (term) => {
    setQuery(term);
    navigate(`/tours?search=${encodeURIComponent(term)}`);
  };

  const trendingTags = ['Switzerland', 'Tokyo', 'Paris', 'Dubai', 'Maldives'];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 font-sans text-left z-20">
      {/* Search Container */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 md:p-4 rounded-[1.8rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col md:flex-row gap-2 items-center transition-all duration-300 focus-within:border-gold-500/50"
      >
        {/* Location Input / Dropdown */}
        <div className="relative w-full md:w-[45%] px-4 py-2 border-b md:border-b-0 md:border-r border-white/20 shrink-0" ref={destDropdownRef}>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setShowDestDropdown(true); setShowCatDropdown(false); }}>
            <MapPin className="text-gold-400 w-5 h-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="block text-[9px] uppercase font-bold text-white/50 tracking-wider">Where to go?</span>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedDestObj(null);
                  setShowDestDropdown(true);
                }}
                onFocus={() => { setShowDestDropdown(true); setShowCatDropdown(false); }}
                placeholder="Search countries, cities..."
                className="bg-transparent border-none text-white placeholder-white/45 focus:outline-none w-full text-xs font-semibold p-0 mt-0.5"
              />
            </div>
            {query && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearSearch(); setSelectedDestObj(null); }}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDestDropdown && (
            <div className="absolute left-0 mt-4 w-[320px] md:w-[380px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn flex flex-col gap-2">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 pb-1 border-b border-white/5 flex justify-between items-center">
                <span>Suggestions</span>
                {searchHistory.length > 0 && (
                  <button type="button" onClick={clearHistory} className="text-[9px] text-gold-400 hover:underline normal-case font-semibold">
                    Clear History
                  </button>
                )}
              </div>

              {/* suggestions list */}
              <div className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1">
                {loading && (
                  <div className="flex items-center justify-center py-4 text-xs text-white/50">
                    <span className="w-4 h-4 rounded-full border border-white/20 border-t-gold-400 animate-spin mr-2" />
                    Searching...
                  </div>
                )}
                {!loading && query && suggestions.length === 0 && (
                  <div className="text-center py-4 text-xs text-white/40 italic">No matching locations found</div>
                )}

                {/* Suggestions items */}
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-left w-full group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/5 text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {item.flag || <Compass className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <strong className="text-xs text-white block truncate group-hover:text-gold-400 transition-colors">
                        {item.city || item.formattedAddress?.split(',')?.[0]}
                      </strong>
                      <span className="text-[10px] text-white/40 block truncate">
                        {item.state ? `${item.state}, ` : ''}{item.country}
                      </span>
                    </div>
                  </button>
                ))}

                {/* Search History list */}
                {!query && searchHistory.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-left w-full text-white/80 hover:text-white text-xs font-semibold"
                  >
                    <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <span className="truncate">{item.city || item.country || item.formattedAddress}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Experience Dropdown */}
        <div className="relative w-full md:w-[35%] px-4 py-2 border-b md:border-b-0 md:border-r border-white/20 shrink-0" ref={catDropdownRef}>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setShowCatDropdown(!showCatDropdown); setShowDestDropdown(false); }}>
            <Calendar className="text-gold-400 w-5 h-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="block text-[9px] uppercase font-bold text-white/50 tracking-wider">Experience</span>
              <span className="block text-xs font-bold text-white truncate mt-0.5">
                {selectedCatObj ? selectedCatObj.name : 'Select Style'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${showCatDropdown ? 'rotate-180' : ''}`} />
          </div>

          {showCatDropdown && (
            <div className="absolute left-0 mt-4 w-[280px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn flex flex-col gap-2">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 pb-1 border-b border-white/5 flex justify-between items-center">
                <span>Categories</span>
                <button type="button" onClick={() => setSelectedCatObj(null)} className="text-[9px] text-gold-400 hover:underline">
                  All Styles
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => {
                      setSelectedCatObj(cat);
                      setShowCatDropdown(false);
                    }}
                    className="px-3 py-2 rounded-xl text-left w-full hover:bg-white/5 border border-transparent hover:border-white/10 text-xs font-bold text-white hover:text-gold-400 transition-all truncate"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold px-8 py-3.5 rounded-2xl w-full md:w-[20%] shadow-lg shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 transition-all duration-200 shrink-0"
        >
          <Search className="w-4 h-4" /> Explore
        </button>
      </form>

      {/* Trending & Quick Tags */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 text-xs">
        <span className="text-white/60 font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Trending:
        </span>
        {trendingTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTrendingClick(tag)}
            className="bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 px-3 py-1 rounded-full text-white/90 hover:text-white font-medium transition-all"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
