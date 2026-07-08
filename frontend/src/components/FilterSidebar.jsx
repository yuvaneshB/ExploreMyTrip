import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Trash2, Check, Star } from 'lucide-react';
import PriceSlider from './PriceSlider.jsx';
import api from '../services/api.js';

export const FilterSidebar = ({ 
  categories = [], 
  onApply, 
  initialFilters = {}, 
  className = '',
  searchResults = null
}) => {
  const uniqueCategories = searchResults 
    ? Array.from(new Set(searchResults.map(item => item.category).filter(Boolean)))
    : [];
  
  const uniqueCountries = searchResults
    ? Array.from(new Set(searchResults.map(item => item.country).filter(Boolean)))
    : [];

  const uniqueCities = searchResults
    ? Array.from(new Set(searchResults.map(item => item.city).filter(Boolean)))
    : [];

  const maxPriceValue = searchResults && searchResults.length > 0
    ? Math.max(...searchResults.map(item => Number(item.price) || 0).filter(p => !isNaN(p)))
    : 4000;

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
        console.warn('Failed to load filters metadata:', err.message);
      }
    };
    fetchMetadata();
  }, []);

  // Sync with initialFilters if they change from parent (e.g. on URL change/reset)
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

  const handleReset = () => {
    setCategory('');
    setCountry('');
    setCity('');
    setPriceMax('');
    setDurationMax('');
    setRating('');
    setDifficulty('');
    setAvailability('');
    setSortBy('newest');
    
    // Instantly notify parent
    onApply({
      category: '',
      country: '',
      city: '',
      priceMax: '',
      durationMax: '',
      rating: '',
      difficulty: '',
      availability: '',
      sortBy: 'newest'
    });
  };

  return (
    <div className={`bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6 font-sans w-full max-w-sm shrink-0 self-start ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="font-bold flex items-center gap-2 text-slate-800 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-gold-500" /> Advanced Filters
        </h3>
        <button 
          onClick={handleReset}
          className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      <form onSubmit={handleApply} className="space-y-5">
        {/* Category */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs cursor-pointer text-slate-700 font-medium"
          >
            <option value="">All Categories</option>
            {searchResults ? (
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
            {searchResults ? (
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
            {searchResults ? (
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
                className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  rating === val.toString()
                    ? 'bg-gold-500 border-gold-500 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-350 text-slate-600'
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
                className={`flex-1 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                  difficulty === diff
                    ? 'bg-gold-500 border-gold-500 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-350 text-slate-600'
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
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input 
              type="checkbox"
              checked={availability === 'available'}
              onChange={(e) => setAvailability(e.target.checked ? 'available' : '')}
              className="rounded border-slate-300 text-gold-500 focus:ring-gold-500 w-4 h-4"
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
          className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-gold-500/10 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400"
        >
          <Check className="w-4 h-4" /> Apply Active Filters
        </button>
      </form>
    </div>
  );
};

export default FilterSidebar;
