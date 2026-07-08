import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { Grid, Map, Search, MapPin, Compass, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import StickyFilterSidebar from '../components/tours/StickyFilterSidebar.jsx';
import DestinationGrid from '../components/tours/DestinationGrid.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import LeafletMap from '../components/LeafletMap.jsx';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = ['Paris', 'Tokyo', 'Bali', 'Switzerland', 'Goa', 'New York', 'London', 'Dubai'];

export const TourListingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Helper to parse query parameters
  const getParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      search: params.get('search') || '',
      category: params.get('category') || '',
      country: params.get('country') || '',
      city: params.get('city') || '',
      priceMax: params.get('priceMax') || '',
      durationMax: params.get('durationMax') || '',
      rating: params.get('rating') || '',
      difficulty: params.get('difficulty') || '',
      availability: params.get('availability') || '',
      sortBy: params.get('sortBy') || 'newest'
    };
  }, [location.search]);

  const currentFilters = getParams();
  const { search, category, country, city, priceMax, durationMax, rating, difficulty, availability, sortBy } = currentFilters;

  // States
  const [rawResults, setRawResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Load listing metadata (categories/destinations) for suggestions & filters
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsRes, destsRes] = await Promise.all([
          api.get('/tours/categories'),
          api.get('/tours/destinations')
        ]);
        if (catsRes.data.success) setCategories(catsRes.data.categories);
        if (destsRes.data.success) setDestinations(destsRes.data.destinations);
      } catch (err) {
        console.error('Failed to load filter metadata:', err.message);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch search results from the API
  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/destinations/search?q=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setRawResults(res.data.data);
      }
    } catch (err) {
      console.error('Failed to search destinations:', err.message);
      toast.error('Search failed. Using cached/local values.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  // Synchronize frontend filters and sorting with the current rawResults
  useEffect(() => {
    let list = [...rawResults];

    // Filter by Category
    if (category) {
      list = list.filter(item => 
        String(item.category).toLowerCase() === String(category).toLowerCase()
      );
    }
    // Filter by Country
    if (country) {
      list = list.filter(item => 
        String(item.country).toLowerCase() === String(country).toLowerCase()
      );
    }
    // Filter by City
    if (city) {
      list = list.filter(item => 
        String(item.city).toLowerCase() === String(city).toLowerCase()
      );
    }
    // Filter by Budget (Price)
    if (priceMax) {
      list = list.filter(item => item.price <= Number(priceMax));
    }
    // Filter by Duration
    if (durationMax) {
      list = list.filter(item => {
        const num = parseInt(item.duration?.replace(/[^0-9]/g, '')) || 0;
        if (String(item.duration).toLowerCase().includes('day')) {
          return num <= Number(durationMax);
        } else {
          return Math.ceil(num / 8) <= Number(durationMax);
        }
      });
    }
    // Filter by Rating
    if (rating) {
      list = list.filter(item => item.rating >= Number(rating));
    }

    // Sort order definition
    if (sortBy === 'priceAsc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'ratingDesc') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'durationAsc') {
      const getDays = str => {
        const num = parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
        return String(str).toLowerCase().includes('day') ? num : Math.ceil(num / 8);
      };
      list.sort((a, b) => getDays(a.duration) - getDays(b.duration));
    } else if (sortBy === 'durationDesc') {
      const getDays = str => {
        const num = parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
        return String(str).toLowerCase().includes('day') ? num : Math.ceil(num / 8);
      };
      list.sort((a, b) => getDays(b.duration) - getDays(a.duration));
    }

    setFilteredResults(list);
  }, [rawResults, category, country, city, priceMax, durationMax, rating, sortBy]);

  // Synchronize state with URL parameters
  const handleApplyFilters = (newFilters) => {
    const params = new URLSearchParams(location.search);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    navigate(`/tours?${params.toString()}`, { replace: true });
  };

  const handleSearchSubmit = (dest) => {
    const params = new URLSearchParams(location.search);
    if (dest) {
      const searchVal = dest.city || dest.country || dest.formattedAddress;
      params.set('search', searchVal);
    } else {
      params.delete('search');
    }
    navigate(`/tours?${params.toString()}`, { replace: true });
  };

  const handleReset = () => {
    navigate('/tours', { replace: true });
  };

  const handleRemoveChip = (key) => {
    const params = new URLSearchParams(location.search);
    params.delete(key);
    navigate(`/tours?${params.toString()}`, { replace: true });
  };

  const handleSuggestionClick = (keyword) => {
    const params = new URLSearchParams(location.search);
    params.set('search', keyword);
    navigate(`/tours?${params.toString()}`, { replace: true });
  };

  const handleBookNow = async (item) => {
    setLoading(true);
    try {
      let slug = item.slug;
      if (!item.isLocal || !slug) {
        // Dynamic search item: ensure in DB first
        const res = await api.post('/destinations/ensure', {
          name: item.name,
          country: item.country,
          city: item.city,
          category: item.category,
          image: item.image,
          rating: item.rating,
          price: item.price,
          duration: item.duration,
          description: item.description,
          coordinates: item.coordinates
        });
        if (res.data.success) {
          slug = res.data.slug;
        }
      }
      navigate(`/tours/${slug}`);
    } catch (err) {
      console.error('Book now prepare error:', err);
      toast.error('Failed to prepare booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Compile Leaflet map markers
  const getMapPoints = () => {
    return filteredResults.map(item => ({
      name: item.name,
      latitude: item.coordinates?.latitude,
      longitude: item.coordinates?.longitude,
      type: item.category || 'Sightseeing',
      rating: item.rating || 4.5,
      distance: `$${item.price}`
    }));
  };

  const mapPoints = getMapPoints();
  const mapCenter = filteredResults[0]?.coordinates?.latitude 
    ? {
        latitude: filteredResults[0].coordinates.latitude,
        longitude: filteredResults[0].coordinates.longitude,
        name: filteredResults[0].name
      }
    : { latitude: 48.8566, longitude: 2.3522, name: 'Paris' };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-150">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 leading-tight">
            Discover <span className="text-gold-gradient font-bold">{search ? search : 'Exclusive Getaways'}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">
            Explore amazing destinations and unique travel experiences curated just for you.
          </p>
        </div>
      </div>

      {/* Main layout container with sticky flex */}
      <div className="flex flex-col lg:flex-row gap-8 items-start relative w-full">
        
        {/* DESKTOP SIDEBAR - STICKY POSITIONING */}
        <aside className="hidden lg:block w-[340px] shrink-0 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
          <StickyFilterSidebar
            categories={categories}
            initialFilters={currentFilters}
            onApply={handleApplyFilters}
            onReset={handleReset}
            onRemoveChip={handleRemoveChip}
            rawResults={rawResults}
            filteredCount={filteredResults.length}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onSearchSubmit={handleSearchSubmit}
            onSuggestionClick={handleSuggestionClick}
          />
        </aside>

        {/* MOBILE/TABLET STICKY FILTER ACTION TOP BAR */}
        <div className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-3 rounded-2xl lg:hidden w-full mb-2">
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-gold-600 cursor-pointer border-none outline-none"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters Panel
          </button>
          <span className="text-xs font-extrabold text-slate-550 mr-1.5">
            {filteredResults.length} Matching Escapes
          </span>
        </div>

        {/* MOBILE/TABLET COLLAPSIBLE DRAWER FILTER SIDEBAR PANEL */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Backdrop overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
              />
              
              {/* Slide-over panel contents */}
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed top-0 bottom-0 left-0 w-full max-w-[340px] bg-slate-50 shadow-2xl p-5 overflow-y-auto flex flex-col gap-4 z-50"
              >
                <div className="flex items-center justify-between border-b border-slate-250 pb-3">
                  <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Filters Panel</span>
                  <button 
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="px-2.5 py-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors border-none cursor-pointer text-xs font-bold"
                  >
                    Close ✕
                  </button>
                </div>
                <div className="flex-1 mt-2">
                  <StickyFilterSidebar
                    categories={categories}
                    initialFilters={currentFilters}
                    onApply={(f) => { handleApplyFilters(f); setIsMobileFilterOpen(false); }}
                    onReset={() => { handleReset(); setIsMobileFilterOpen(false); }}
                    onRemoveChip={handleRemoveChip}
                    rawResults={rawResults}
                    filteredCount={filteredResults.length}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onSearchSubmit={(s) => { handleSearchSubmit(s); setIsMobileFilterOpen(false); }}
                    onSuggestionClick={(s) => { handleSuggestionClick(s); setIsMobileFilterOpen(false); }}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* RESULTS AREA - SCROLLS INDEPENDENTLY */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          
          {loading ? (
            <LoadingSkeleton.Listing count={3} />
          ) : filteredResults.length === 0 ? (
            <div className="space-y-8 text-left">
              {rawResults.length === 0 && search ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-6 shadow-sm animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-gold-500 border border-amber-100">
                    <Compass className="w-8 h-8" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <h3 className="text-xl font-extrabold text-slate-800">{search} Tours Are Coming Soon</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      We don't have an available tour for {search} right now. We're expanding our destinations and expect to bring this location to ExploreMyTrip soon.
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2.5">
                      Explore our currently available destinations in the meantime.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-6 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-gold-500 border border-amber-100">
                    <Search className="w-8 h-8" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <h3 className="text-xl font-extrabold text-slate-800">No Escapes Found</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      We couldn't find any destinations matching "{search || 'your active filters'}". Try searching globally popular places or resetting filters.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow border-none"
                    >
                      Reset Active Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Suggestions Block */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6 space-y-4">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Popular Travel Suggestions</h4>
                <div className="flex flex-wrap gap-2.5">
                  {SUGGESTIONS.map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => handleSuggestionClick(keyword)}
                      className="px-4 py-2 bg-white hover:bg-gold-50 hover:text-gold-600 border border-slate-225 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      🌴 {keyword}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === 'map' ? (
            <div className="space-y-4 text-left">
              <p className="text-xs text-slate-400 font-bold tracking-wide italic">Showing {mapPoints.length} mapped destinations</p>
              <div className="h-[550px] w-full bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200 shadow-inner relative z-10">
                <LeafletMap startLocation={mapCenter} endLocation={null} places={mapPoints} height="100%" />
              </div>
            </div>
          ) : (
            <DestinationGrid 
              results={filteredResults}
              handleBookNow={handleBookNow}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default TourListingPage;
