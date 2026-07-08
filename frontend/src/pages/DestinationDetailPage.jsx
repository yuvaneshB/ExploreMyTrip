import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  ArrowLeft, Calendar, Star, MapPin, Compass, Check, Clock, 
  DollarSign, Info, ShieldAlert, CloudSun, Hotel, Utensils 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import LeafletMap from '../components/LeafletMap.jsx';
import WishlistButton from '../components/WishlistButton.jsx';
import useNearbyPlaces from '../hooks/useNearbyPlaces.js';

export const DestinationDetailPage = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get('name') || '';
  const city = searchParams.get('city') || '';
  const country = searchParams.get('country') || '';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('hotels'); // 'hotels', 'restaurants', 'attractions'
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Fetch details from backend details API
  useEffect(() => {
    if (!name) {
      setError('No destination selected');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/destinations/details`, {
          params: { name, city, country }
        });
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError('Failed to retrieve destination details.');
        }
      } catch (err) {
        console.error('Failed to load destination details:', err.message);
        setError(err.response?.data?.message || 'Failed to load details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [name, city, country]);

  // Hook for nearby places
  const nearbyCategory = activeTab === 'hotels' ? 'accommodation' : activeTab === 'restaurants' ? 'catering' : 'tourism';
  const { places: nearbyPlaces, loading: placesLoading } = useNearbyPlaces(
    data?.coordinates?.latitude,
    data?.coordinates?.longitude,
    nearbyCategory
  );

  const handleBookTour = async () => {
    if (!data) return;
    setLoading(true);
    try {
      let slug = data.slug;
      if (!data.isLocal || !slug) {
        const res = await api.post('/destinations/ensure', {
          name: data.name,
          country: data.country,
          city: data.city,
          category: data.category,
          image: data.image,
          rating: data.rating,
          price: data.price,
          duration: data.duration,
          description: data.description,
          coordinates: data.coordinates
        });
        if (res.data.success) {
          slug = res.data.slug;
        }
      }
      // Redirect to the booking setup on TourDetailPage
      navigate(`/tours/${slug}`);
    } catch (err) {
      console.error('Failed to process booking redirection:', err.message);
      toast.error('Booking failed. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 animate-pulse space-y-8 font-sans">
        <div className="h-6 w-24 bg-slate-200 rounded" />
        <div className="h-96 bg-slate-200 rounded-3xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
          </div>
          <div className="bg-slate-200 h-64 rounded-3xl w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 space-y-6 font-sans">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Detail Guide Not Found</h2>
        <p className="text-slate-500 text-sm leading-relaxed">{error || "We couldn't retrieve details for this spot."}</p>
        <Link to="/tours" className="inline-flex items-center gap-1.5 bg-gold-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-gold-600 transition-colors shadow-md">
          <ArrowLeft className="w-4 h-4" /> Back to Discovery Grid
        </Link>
      </div>
    );
  }

  // Pre-compiled mock reviews for realistic display
  const mockReviews = [
    { name: 'Alex Johnson', date: 'June 2026', rating: 5, comment: `An absolute masterpiece! The visit was extremely well coordinated and the views were stellar. Recommended to skip lines and arrive early.` },
    { name: 'Sophie Dupont', date: 'May 2026', rating: 4.8, comment: `Incredibly beautiful location. We walked around for hours. The entry price is definitely worth the sights.` },
    { name: 'Ravi Kumar', date: 'April 2026', rating: 5, comment: `Outstanding experience. Everything felt top-notch and our guide was highly knowledgeable. Highly recommend the standard packages.` }
  ];

  const images = data.images && data.images.length > 0 ? data.images : [data.image];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans space-y-8 animate-fadeIn">
      {/* Back Link */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-850 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Return to listing</span>
      </button>

      {/* Image Gallery Header */}
      <div className="space-y-4">
        <div className="h-[480px] w-full rounded-3xl overflow-hidden relative border border-slate-200 shadow-sm bg-slate-100">
          <img 
            src={images[activeImageIdx] || data.image} 
            alt={data.name} 
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-6 left-6 text-white space-y-2">
            <span className="bg-gold-500 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {data.category} Discovery
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{data.name}</h1>
            <p className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
              <MapPin className="w-4 h-4 text-gold-400" /> {data.city}, {data.country}
            </p>
          </div>

          <div className="absolute top-4 right-4 z-20">
            <WishlistButton tour={data} className="p-3 bg-white/95 text-rose-500 border border-rose-100 shadow-md" />
          </div>
        </div>

        {/* Gallery Selection List */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-28 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${activeImageIdx === idx ? 'border-gold-500 scale-95 shadow-sm' : 'border-transparent opacity-75 hover:opacity-100 hover:scale-98'}`}
              >
                <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Overview & Local Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-100 pb-3">Destination Overview</h3>
            <p className="text-sm text-slate-650 leading-relaxed font-medium">{data.description}</p>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Explore the rich historical values, surrounding nature, local sights, and dynamic markers. This {data.category?.toLowerCase() || 'attraction'} is one of the most highly recommended sightseeing destinations in {data.city}.
            </p>
          </div>

          {/* Highlights */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-100 pb-3">Key Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {[
                'Instant confirmation on checkout reservation',
                'Expert english-speaking tour guides included',
                'Skip-the-line Admission Ticket pre-arranged',
                'Comfortable, air-conditioned transport transfer options',
                'Free cancellations up to 24 hours prior to departure',
                'Highly photography-friendly landmarks'
              ].map((hl, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Widget */}
          {data.details?.weather && (
            <div className="bg-gradient-to-br from-gold-500 to-amber-500 text-white p-6 md:p-8 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <CloudSun className="absolute right-4 bottom-4 w-40 h-40 text-white/5 pointer-events-none -rotate-12" />
              
              <div className="space-y-3 shrink-0 text-center md:text-left z-10">
                <span className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">Live Forecast Update</span>
                <div>
                  <h4 className="font-extrabold text-lg">{data.city} Forecast</h4>
                  <p className="text-xs text-white/80 font-semibold">{data.details.weather.condition}</p>
                </div>
              </div>

              <div className="text-center md:text-right shrink-0 z-10">
                <span className="text-5xl font-black">{data.details.weather.temperature}°C</span>
                <div className="flex gap-4 mt-2 justify-center md:justify-end text-[10px] uppercase font-bold text-white/90">
                  <div>
                    <span className="text-white/60 block text-[9px]">Humidity</span>
                    <span>{data.details.weather.humidity}%</span>
                  </div>
                  <div>
                    <span className="text-white/60 block text-[9px]">Wind Speed</span>
                    <span>{data.details.weather.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Leaflet Map */}
          {data.coordinates && (
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl space-y-4 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-gold-500" /> Geographic Location Mapping
              </h3>
              <div className="h-80 w-full bg-slate-50 rounded-2xl overflow-hidden relative z-10 border border-slate-200">
                <LeafletMap 
                  startLocation={{
                    latitude: data.coordinates.latitude,
                    longitude: data.coordinates.longitude,
                    name: data.name
                  }} 
                  height="100%" 
                />
              </div>
            </div>
          )}

          {/* Nearby Places Tabs */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
              <h3 className="font-extrabold text-slate-800 text-lg">Nearby Surrounding Places</h3>
              <div className="flex gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-inner text-slate-500 font-bold text-[11px] self-start">
                {[
                  { id: 'hotels', label: 'Accommodation', icon: Hotel },
                  { id: 'restaurants', label: 'Dining / Food', icon: Utensils },
                  { id: 'attractions', label: 'Spots / Parks', icon: Compass }
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === t.id ? 'bg-gold-500 text-white shadow-sm' : 'hover:text-slate-700'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {placesLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
                Fetching surrounding location details...
              </div>
            ) : nearbyPlaces.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 italic font-semibold">
                No surrounding places found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearbyPlaces.slice(0, 4).map((place, idx) => (
                  <div key={idx} className="border border-slate-150 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <div className="space-y-1">
                      <strong className="text-xs text-slate-800 block truncate font-bold">{place.name}</strong>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{place.type}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-50 text-[11px] font-bold text-slate-500">
                      <span className="text-amber-500">★ {place.rating}</span>
                      <span>{place.distance} away</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Travelers Experience ({data.reviewsCount || 3})
            </h3>
            
            <div className="divide-y divide-slate-100 space-y-6">
              {mockReviews.map((rev, i) => (
                <div key={i} className={`pt-6 ${i === 0 ? 'pt-0' : ''} space-y-2.5`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-xs font-bold text-slate-800 block">{rev.name}</strong>
                      <span className="text-[10px] text-slate-400 font-semibold">{rev.date}</span>
                    </div>
                    <span className="bg-amber-50 text-amber-600 border border-amber-100 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 shadow-inner">
                      ★ {rev.rating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Sticky Checkout / Booking Sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6 z-10">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Tour Admission Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gold-500">${data.price}</span>
                <span className="text-slate-400 text-xs font-bold">/ guest</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3.5 text-xs text-slate-600 font-semibold">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-4 h-4 shrink-0" /> Duration
                </span>
                <span className="text-slate-800 font-bold">{data.duration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <DollarSign className="w-4 h-4 shrink-0" /> Entry Fee
                </span>
                <span className="text-slate-800 font-bold">{data.details?.entryFee || 'Free'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Info className="w-4 h-4 shrink-0" /> Opening Hours
                </span>
                <span className="text-slate-800 font-bold">{data.details?.openingHours || '09:00 AM - 05:00 PM'}</span>
              </div>
            </div>

            {/* Book Tour CTA Button */}
            <button
              onClick={handleBookTour}
              className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-gold-500/10 cursor-pointer text-center block"
            >
              Book guided tour now
            </button>

            <p className="text-[10px] text-slate-400 leading-normal text-center font-bold">
              Secure your reservation dates and get instant updates on itinerary variations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetailPage;
