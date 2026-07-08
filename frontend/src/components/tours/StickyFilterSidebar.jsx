import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Trash2, Check, Grid, Map, Search, MapPin, Sparkles } from 'lucide-react';
import PriceSlider from '../PriceSlider.jsx';
import SearchBar from '../SearchBar.jsx';
import ActiveFilterChips from './ActiveFilterChips.jsx';
import api from '../../services/api.js';

const POPULAR_TAGS = ['Paris', 'Tokyo', 'Bali', 'Switzerland', 'Goa', 'New York', 'London', 'Dubai'];

export const StickyFilterSidebar = ({
  categories = [],
  initialFilters = {},
  onApply,
  onReset,
  onRemoveChip,
  rawResults = [],
  filteredCount = 0,
  viewMode = 'grid',
  setViewMode,
  onSearchSubmit,
  onSuggestionClick,
  className = ''
}) => {
  const uniqueCategories = rawResults 
    ? Array.from(new Set(rawResults.map(item => item.category).filter(Boolean)))
    : [];
  
  const uniqueCountries = rawResults
    ? Array.from(new Set(rawResults.map(item => item.country).filter(Boolean)))
    : [];

  const uniqueCities = rawResults
    ? Array.from(new Set(rawResults.map(item => item.city).filter(Boolean)))
    : [];

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  
  // Local filter states
  const [category, setCategory] = useState(initialFilters.category || '');
  const [country, setCountry] = useState(initialFilters.country || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax || '');
  const [durationMax, setDurationMax] = useState(initialFilters.durationMax || '');
  const [rating, setRating] = useState(initialFilters.rating || '');
  const [difficulty, setDifficulty] = useState(initialFilters.difficulty || '');
  const [availability, setAvailability] = useState(initialFilters.availability || '');
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'newest');

  // Load countries & cities dynamically
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [countriesRes, citiesRes] = await Promise.all([
          api.get('/tours/countries'),
          api.get('/tours/cities')
        ]);
        if (countriesRes.data.success) {
          setCountries(countriesRes.data.countries);
        }
        if (citiesRes.data.success) {
          setCities(citiesRes.data.cities);
        }
      } catch (err) {
        console.warn('Failed to load filters metadata in sidebar:', err.message);
      }
    };
    fetchMetadata();
  }, []);

  // Sync local state when parent initialFilters change (e.g. from URL changes or reset)
  useEffect(() => {
    setCategory(initialFilters.category || '');
    setCountry(initialFilters.country || '');
    setCity(initialFilters.city || '');
    setPriceMax(initialFilters.priceMax || '');
    setDurationMax(initialFilters.durationMax || '');
    setRating(initialFilters.rating || '');
    setDifficulty(initialFilters.difficulty || '');
    setAvailability(initialFilters.availability || '');
    setSortBy(initialFilters.sortBy || 'newest');
  }, [initialFilters]);

  const handleApply = (e) => {
    e?.preventDefault();
    onApply({
      category,
      country,
      city,
      priceMax,
      durationMax,
      rating,
      difficulty,
      availability,
      sortBy
    });
  };

  const handleLocalReset = () => {
    setCategory('');
    setCountry('');
    setCity('');
    setPriceMax('');
    setDurationMax('');
    setRating('');
    setDifficulty('');
    setAvailability('');
    setSortBy('newest');
    onReset();
  };

  return (
    <div className={`flex flex-col gap-6 w-full max-w-sm ${className}`}>
      
      {/* Current Search Summary */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-md space-y-1.5 text-left">
        <span className="text-[9px] bg-gold-500/20 text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit block">
          Search Status
        </span>
        <h4 className="font-extrabold text-sm tracking-wide">
          {initialFilters.search ? `Results for "${initialFilters.search}"` : 'All Active Getaways'}
        </h4>
        <p className="text-slate-400 text-xs font-semibold">
          Found {filteredCount} premium {filteredCount === 1 ? 'destination' : 'destinations'}
        </p>
      </div>

      {/* Main Filter Panel */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm space-y-6 font-sans text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="font-bold flex items-center gap-2 text-slate-800 text-sm">
            <SlidersHorizontal className="w-4 h-4 text-gold-500" /> Advanced Filters
          </h3>
          <button 
            type="button"
            onClick={handleLocalReset}
            className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>

        {/* Search Bar Widget Embedded inside Sidebar */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Search Destination
          </label>
          <SearchBar onSearchSubmit={onSearchSubmit} />
        </div>

        {/* View Toggle */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            View Layout
          </label>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl shadow-inner w-full">
            <button 
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                viewMode === 'grid' 
                  ? 'bg-gold-500 text-white shadow' 
                  : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
            >
              <Grid className="w-4 h-4" /> Grid View
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                viewMode === 'map' 
                  ? 'bg-gold-500 text-white shadow' 
                  : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
            >
              <Map className="w-4 h-4" /> Map View
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        <ActiveFilterChips 
          filters={initialFilters} 
          categories={categories} 
          onRemove={onRemoveChip} 
        />

        <form onSubmit={handleApply} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Category Style
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs cursor-pointer text-slate-700 font-medium"
            >
              <option value="">All Categories</option>
              {rawResults.length > 0 ? (
                uniqueCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))
              ) : (
                categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))
              )}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Country Destination
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs cursor-pointer text-slate-700 font-medium"
            >
              <option value="">All Countries</option>
              {rawResults.length > 0 ? (
                uniqueCountries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))
              ) : (
                countries.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))
              )}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              City Destination
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs cursor-pointer text-slate-700 font-medium"
            >
              <option value="">All Cities</option>
              {rawResults.length > 0 ? (
                uniqueCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))
              ) : (
                cities.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))
              )}
            </select>
          </div>

          {/* Price Slider */}
          <PriceSlider value={priceMax} onChange={setPriceMax} max={4000} />

          {/* Max Days Duration */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Max Duration (Days)
            </label>
            <input
              type="number"
              placeholder="e.g. 10 days"
              value={durationMax}
              onChange={(e) => setDurationMax(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-700 font-medium"
            />
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[4, 4.5, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRating(val.toString() === rating ? '' : val.toString())}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    rating === val.toString()
                      ? 'bg-gold-500 border-gold-500 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-350 text-slate-650'
                  }`}
                >
                  {val}★
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Difficulty Tier
            </label>
            <div className="flex gap-2">
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff === difficulty ? '' : diff)}
                  className={`flex-1 py-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    difficulty === diff
                      ? 'bg-gold-500 border-gold-500 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-350 text-slate-650'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Availability Status
            </label>
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-650 cursor-pointer">
              <input 
                type="checkbox"
                checked={availability === 'available'}
                onChange={(e) => setAvailability(e.target.checked ? 'available' : '')}
                className="rounded border-slate-300 text-gold-500 focus:ring-gold-500 w-4 h-4 cursor-pointer"
              />
              Show only tours with open seats
            </label>
          </div>

          {/* Sorting Order */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Sort Results By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs cursor-pointer text-slate-700 font-medium"
            >
              <option value="newest">Newest Released</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="durationAsc">Duration: Short to Long</option>
              <option value="durationDesc">Duration: Long to Short</option>
              <option value="ratingDesc">Highest Rated</option>
            </select>
          </div>

          {/* Action Buttons */}
          <button
            type="submit"
            className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-gold-500/10 flex items-center justify-center gap-2 cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-gold-400"
          >
            <Check className="w-4 h-4" /> Apply Filters
          </button>
        </form>

        {/* Popular Tags */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Popular Tags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSuggestionClick(tag)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-gold-50 hover:text-gold-600 border border-slate-200 hover:border-gold-200 text-slate-650 font-bold text-[10px] rounded-xl transition-all cursor-pointer"
              >
                🌴 {tag}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StickyFilterSidebar;
