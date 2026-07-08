import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getDiscoverDetails } from '../api/discoverApi.js';
import LeafletMap from '../components/LeafletMap.jsx';
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Compass, 
  Heart, 
  Share2, 
  Navigation, 
  CloudSun, 
  TrendingUp, 
  History, 
  Trash2, 
  AlertTriangle,
  Info,
  Calendar,
  Languages,
  DollarSign as CurrencyIcon,
  Shield,
  Bus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const POPULAR_DESTINATIONS = ['Paris', 'Tokyo', 'Bali', 'London', 'New York', 'Sydney'];

const BannerImage = ({ dest }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <div className="h-64 overflow-hidden relative bg-slate-100">
      {!imageLoaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}
      <img 
        src={dest.image} 
        alt={dest.name} 
        onLoad={() => setImageLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      <div className="absolute bottom-6 left-6 text-white space-y-1">
        <span className="bg-gold-500/90 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Dynamic Discovery
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight">{dest.name}, {dest.country}</h2>
      </div>
    </div>
  );
};

const AttractionCard = ({ attr, isSaved, dest, toggleSaveAttraction, shareAttraction, idx }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
    >
      <div className="h-48 overflow-hidden relative bg-slate-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse" />
        )}
        <img
          src={attr.image}
          alt={attr.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-gold-600 text-[9px] font-bold shadow-sm uppercase tracking-wider">
          {attr.category}
        </span>
        
        <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-md border border-white/10">
          ★ {attr.rating} <span className="text-white/60 font-medium text-[9px]">({attr.reviewsCount || Math.floor(25 + Math.random() * 950)})</span>
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4 font-sans">
        <div className="space-y-1.5">
          <h4 className="font-extrabold text-sm text-slate-850 line-clamp-1">{attr.name}</h4>
          <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-350 shrink-0" />
            <span className="truncate">{dest.name}, {dest.country}</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-3 font-medium">{attr.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-50 pt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-350" /> {attr.duration || '2 Hours'}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-slate-350" /> Starting from ${attr.price || 15}
          </span>
        </div>

        <div className="flex gap-2 items-center justify-between border-t border-slate-100 pt-3.5">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${attr.coordinates.latitude},${attr.coordinates.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" /> Directions
          </a>
          
          <div className="flex gap-1.5">
            <button
              onClick={() => toggleSaveAttraction(attr)}
              aria-label="Save attraction"
              className={`p-2 rounded-xl border border-slate-200 transition-colors cursor-pointer ${
                isSaved ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={() => shareAttraction(attr)}
              aria-label="Share attraction details"
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 bg-transparent transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const DiscoverPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(query);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [destinationData, setDestinationData] = useState(null);
  const [savedAttractions, setSavedAttractions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savedAttractions') || '[]');
    } catch {
      return [];
    }
  });
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    } catch {
      return [];
    }
  });

  // Load and update discovery search data
  useEffect(() => {
    if (!query) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDiscoverDetails(query);
        if (data && data.success) {
          setDestinationData(data);
          
          // Save successful search to history
          setSearchHistory(prev => {
            const cleanQuery = query.trim();
            const filtered = prev.filter(h => h.toLowerCase() !== cleanQuery.toLowerCase());
            const updated = [cleanQuery, ...filtered].slice(0, 8);
            localStorage.setItem('searchHistory', JSON.stringify(updated));
            return updated;
          });
        } else {
          setError('No details found for this destination.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch destination guides. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [query]);

  // Sync state input with param change
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchParams({ q: searchInput.trim() });
  };

  const handlePopularClick = (destName) => {
    setSearchParams({ q: destName });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    toast.success('Search history cleared.');
  };

  const toggleSaveAttraction = (attraction) => {
    setSavedAttractions(prev => {
      const isSaved = prev.some(a => a.name === attraction.name);
      let updated;
      if (isSaved) {
        updated = prev.filter(a => a.name !== attraction.name);
        toast.success(`Removed ${attraction.name} from saved spots`);
      } else {
        updated = [...prev, attraction];
        toast.success(`Saved ${attraction.name} to your travel list!`);
      }
      localStorage.setItem('savedAttractions', JSON.stringify(updated));
      return updated;
    });
  };

  const shareAttraction = (attraction) => {
    const shareText = `Discover ${attraction.name} in ${destinationData?.destination?.name}! Coordinates: ${attraction.coordinates.latitude}, ${attraction.coordinates.longitude}`;
    navigator.clipboard.writeText(shareText);
    toast.success('Copied details link to clipboard!');
  };

  const getMapPlaces = () => {
    if (!destinationData?.attractions) return [];
    return destinationData.attractions.map(attr => ({
      name: attr.name,
      latitude: attr.coordinates.latitude,
      longitude: attr.coordinates.longitude,
      type: attr.category || 'Attraction',
      rating: attr.rating || 4.5,
      distance: attr.entryFee || 'Free'
    }));
  };

  // Skeletons
  const renderSkeletons = () => (
    <div className="space-y-10 animate-pulse">
      <div className="bg-slate-100 h-64 rounded-3xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="border border-slate-200 rounded-3xl overflow-hidden p-4 space-y-4">
            <div className="bg-slate-200 h-48 rounded-2xl w-full" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-6 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );

  const dest = destinationData?.destination;
  const attractions = destinationData?.attractions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 font-sans space-y-8">
      {/* Top Section Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl text-white">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-gold-500 animate-spin-slow" /> Global Guide Discovery
          </h1>
          <p className="text-xs text-slate-400 font-medium">Explore attractions, maps and live weather worldwide</p>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search city, beach, waterfalls, monuments..."
            className="w-full pl-4 pr-12 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-slate-200 focus:text-slate-850 border border-white/20 focus:border-gold-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gold-500/20 text-xs font-semibold tracking-wide transition-all"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-gold-500 cursor-pointer transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {!query ? (
        // Initial Landing / Blank search state
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-600">
              <Compass className="w-10 h-10 animate-pulse" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800">Your Worldwide Passport</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Type any city, island, national park, castle, or monument in the search bar above to fetch summaries, maps, live forecasts, and discover top-rated spots instantly.
              </p>
            </div>
            {/* Quick starts */}
            <div className="flex flex-wrap justify-center gap-2.5">
              {POPULAR_DESTINATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => handlePopularClick(d)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-225 text-slate-700 hover:text-gold-600 font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  🌴 {d}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {searchHistory.length > 0 && (
              <div className="bg-white border border-slate-220 p-5 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-400" /> Recent Queries
                  </h3>
                  <button onClick={clearHistory} className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {searchHistory.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => handlePopularClick(h)}
                      className="w-full text-left py-2.5 text-xs text-slate-600 hover:text-gold-500 font-semibold flex items-center justify-between group cursor-pointer"
                    >
                      <span>{h}</span>
                      <MapPin className="w-3 h-3 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : loading ? (
        renderSkeletons()
      ) : error ? (
        // Error state
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-extrabold text-slate-800">Guide Unavailable</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">{error}</p>
          </div>
          <button
            onClick={() => setSearchParams({ q: query })}
            className="bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Retry Search
          </button>
        </div>
      ) : (
        // Success layout
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Discovery Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero details banner */}
            {dest && (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                {dest.image && (
                  <BannerImage dest={dest} />
                )}
                
                <div className="p-6 space-y-6">
                  {!dest.image && (
                    <div className="space-y-1">
                      <span className="bg-gold-50 text-gold-600 border border-gold-150 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider w-fit block">
                        Dynamic Discovery
                      </span>
                      <h2 className="text-2xl font-extrabold text-slate-850">{dest.name}, {dest.country}</h2>
                    </div>
                  )}
                  
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{dest.description}</p>
                  
                  {/* Flat specifications grid cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl text-gold-500 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Best Visit</span>
                        <span className="text-xs text-slate-700 font-semibold">{dest.bestTimeToVisit}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl text-gold-500 shrink-0">
                        <Languages className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Languages</span>
                        <span className="text-xs text-slate-700 font-semibold">{dest.languages}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl text-gold-500 shrink-0">
                        <CurrencyIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Currency</span>
                        <span className="text-xs text-slate-700 font-semibold">{dest.currency}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl text-gold-500 shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Safety Info</span>
                        <span className="text-xs text-slate-700 font-semibold">{dest.safety}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl text-gold-500 shrink-0">
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Local Transit</span>
                        <span className="text-xs text-slate-700 font-semibold">{dest.transport}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attractions lists grid */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-lg">Top Recommended Attractions</h3>
                <span className="text-xs text-slate-400 font-semibold">{attractions.length} spots discovered</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {attractions.map((attr, idx) => {
                  const isSaved = savedAttractions.some(sa => sa.name === attr.name);
                  return (
                    <AttractionCard 
                      key={idx}
                      attr={attr}
                      isSaved={isSaved}
                      dest={dest}
                      toggleSaveAttraction={toggleSaveAttraction}
                      shareAttraction={shareAttraction}
                      idx={idx}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column Map / Weather / History */}
          <div className="space-y-6">
            {/* Live Weather Widget */}
            {dest?.weather && (
              <div className="bg-gradient-to-br from-gold-500 to-gold-600 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-48">
                {/* Floating graphic */}
                <CloudSun className="absolute right-2.5 bottom-2.5 w-32 h-32 text-white/10 -rotate-12 pointer-events-none" />
                
                <div className="flex justify-between items-start z-10">
                  <div>
                    <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider block">Live weather</span>
                    <h4 className="font-extrabold text-sm">{dest.name} forecast</h4>
                  </div>
                  <span className="bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {dest.weather.condition}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 z-10">
                  <span className="text-4xl font-extrabold">{dest.weather.temperature}°C</span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-3 text-[10px] font-bold uppercase tracking-wider text-white/90 z-10">
                  <div>
                    <span className="text-[8px] text-white/60 block">Humidity</span>
                    <span>{dest.weather.humidity}%</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/60 block">Wind speed</span>
                    <span>{dest.weather.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Leaflet Map */}
            {dest?.coordinates && (
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block font-sans">Attractions Mapping</span>
                <LeafletMap
                  startLocation={{
                    latitude: dest.coordinates.latitude,
                    longitude: dest.coordinates.longitude,
                    name: dest.name
                  }}
                  places={getMapPlaces()}
                  height="340px"
                />
              </div>
            )}

            {/* Recent Search Sidebar */}
            {searchHistory.length > 0 && (
              <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-400" /> Recent Guides
                  </h3>
                  <button onClick={clearHistory} className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {searchHistory.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => handlePopularClick(h)}
                      className="w-full text-left py-2.5 text-xs text-slate-650 hover:text-gold-500 font-semibold flex items-center justify-between group cursor-pointer"
                    >
                      <span>{h}</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Discoveries */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-slate-400" /> Popular Worldwide
              </h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_DESTINATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => handlePopularClick(d)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-gold-50 border border-slate-200 text-slate-650 hover:text-gold-600 font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
