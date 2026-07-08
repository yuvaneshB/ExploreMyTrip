import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Calendar, Star, MapPin, Compass, Check, X, 
  AlertCircle, ChevronDown, ShieldCheck, Heart, ArrowLeft, ArrowRight, HelpCircle,
  Car
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Reusable components imports
import ImageGallery from '../components/ImageGallery.jsx';
import WeatherCard from '../components/WeatherCard.jsx';
import CountryCard from '../components/CountryCard.jsx';
import MapCard from '../components/MapCard.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import StickyBookingCard from '../components/StickyBookingCard.jsx';
import WishlistButton from '../components/WishlistButton.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import useNearbyPlaces from '../hooks/useNearbyPlaces.js';

export const TourDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Accordion faq states
  const [faqOpen, setFaqOpen] = useState({});

  // Seat hold forms state
  const [selectedDeparture, setSelectedDeparture] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [numSeats, setNumSeats] = useState(1);
  const [holdLoading, setHoldLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'reviews'

  const [nearbyCategory, setNearbyCategory] = useState('all');
  const { places: nearbyPlaces, loading: placesLoading, error: placesError } = useNearbyPlaces(
    tour?.startLocation?.latitude,
    tour?.startLocation?.longitude,
    nearbyCategory
  );

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/tours/${slug}`);
        if (res.data.success) {
          const fetchedTour = res.data.tour;
          setTour(fetchedTour);
          
          // Defaults config
          if (fetchedTour.pricingPlans?.length > 0) {
            setSelectedPlan(fetchedTour.pricingPlans[0].name);
          }
          if (fetchedTour.departures?.length > 0) {
            const firstAvail = fetchedTour.departures.find(d => d.availableSeats > 0);
            if (firstAvail) setSelectedDeparture(firstAvail.date);
          }

          // Fetch reviews
          const revRes = await api.get(`/reviews/tour/${fetchedTour._id}`);
          if (revRes.data.success) setReviews(revRes.data.reviews);
        }
      } catch (err) {
        toast.error('Failed to load tour details');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [slug]);

  if (loading) return <LoadingSkeleton.Detail />;
  if (!tour) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 space-y-6 font-sans">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Tour Escape Not Found</h2>
        <p className="text-slate-500 text-sm">We couldn't retrieve details for this package. It may have been archived or removed by agency staff.</p>
        <Link to="/tours" className="inline-block bg-gold-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs">
          Browse All Tours
        </Link>
      </div>
    );
  }

  const currentPlan = tour.pricingPlans.find(p => p.name === selectedPlan);
  const currentDeparture = tour.departures.find(d => 
    new Date(d.date).toDateString() === new Date(selectedDeparture).toDateString()
  );

  const handleReserveSeats = async () => {
    if (!user) {
      toast.error('Please login to hold seats');
      navigate('/login');
      return;
    }

    if (!selectedDeparture) {
      toast.error('Please select departure date');
      return;
    }

    if (!selectedPlan) {
      toast.error('Please select pricing plan');
      return;
    }

    setHoldLoading(true);
    try {
      const travelers = Array(numSeats).fill(0).map((_, idx) => ({
        name: `${user.name} Traveler ${idx + 1}`,
        age: 30,
        gender: 'Male',
        passportNumber: 'PASS-MOCK-EXPT',
        passportExpiry: new Date('2033-12-31')
      }));

      const res = await api.post('/bookings/hold', {
        tourId: tour._id,
        departureDate: selectedDeparture,
        pricingPlanName: selectedPlan,
        numSeats,
        travelers
      });

      if (res.data.success) {
        toast.success(res.data.message, { duration: 6000 });
        navigate('/checkout', { 
          state: { 
            bookingId: res.data.bookingId,
            totalAmount: res.data.totalAmount,
            holdExpiresAt: res.data.holdExpiresAt
          } 
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to hold seats');
    } finally {
      setHoldLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    try {
      const res = await api.post('/reviews', {
        tourId: tour._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setReviewTitle('');
        setReviewComment('');
        // Re-load reviews
        const revRes = await api.get(`/reviews/tour/${tour._id}`);
        if (revRes.data.success) setReviews(revRes.data.reviews);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    }
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const faqsList = [
    { q: "What should I pack for this trip?", a: "We recommend comfortable walking or hiking shoes, layers for weather transitions, a reusable water bottle, sunscreen, and essential personal medications." },
    { q: "Is travel insurance required?", a: "While not strictly mandatory for reservation holds, we highly advise procuring robust travel coverage including health support and flight cancellation insurance." },
    { q: "Can I customize the daily itinerary schedules?", a: "Our packages run on predefined structural schedules. Private deluxe/luxury tours can occasionally adjust timelines in consultation with the assigned local guide." }
  ];

  // Primary destinations metadata (for Weather and REST Countries cards)
  const destinationObj = tour.destinations?.[0] || {};
  const countryName = tour.country || destinationObj.country?.name || '';
  const attractionsList = destinationObj.popularAttractions || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans space-y-10">
      
      {/* Return button */}
      <Link to="/tours" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-gold-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Return to Listings
      </Link>

      {/* Gallery Section */}
      <ImageGallery images={tour.images} />

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Side Content */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Header Title block */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800 leading-tight">
                {tour.title}
              </h1>
              <div className="shrink-0 mt-2">
                <WishlistButton tour={tour} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="bg-gold-50 border border-gold-150 px-3.5 py-1.5 rounded-full text-gold-600 uppercase tracking-wide">
                {tour.category?.name || 'Escapes'}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                <Calendar className="w-3.5 h-3.5 text-gold-500" /> {tour.durationDays} Days / {tour.durationDays - 1} Nights
              </span>
              <span className="flex items-center gap-1 text-amber-500 bg-amber-50/50 border border-amber-100/50 px-3 py-1.5 rounded-full font-bold">
                ★ {tour.averageRating} ({reviews.length} feedback reviews)
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mt-4 font-medium">{tour.description}</p>
          </div>

          {/* Highlights, Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 p-8 rounded-3xl">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-200/60 pb-2">
                <Car className="text-gold-500 w-4 h-4" /> Trip Highlights
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                {tour.highlights?.map((h, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <Check className="text-gold-500 w-4 h-4 shrink-0 mt-0.5" /> <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-200/60 pb-2">
                <ShieldCheck className="text-emerald-500 w-4 h-4" /> Package details
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Whats Included</span>
                  <ul className="space-y-2 text-xs text-slate-500">
                    {tour.inclusions?.map((inc, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <Check className="text-emerald-500 w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 font-sans">Whats Excluded</span>
                  <ul className="space-y-2 text-xs text-slate-500">
                    {tour.exclusions?.map((exc, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <X className="text-rose-500 w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Details tab switcher */}
          <div className="border-b border-slate-200">
            <div className="flex gap-6">
              {['map', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === tab 
                      ? 'border-gold-500 text-gold-500' 
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab === 'map' ? 'Route & Attractions' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Contents */}
          <div className="min-h-[300px]">


            {activeTab === 'map' && (
              <div className="space-y-6">
                <MapCard 
                  startLocation={tour.startLocation} 
                  endLocation={tour.endLocation} 
                  attractions={attractionsList} 
                  places={nearbyPlaces}
                />

                {/* Nearby Places Section */}
                <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 space-y-4 font-sans">
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Nearby Discoveries</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Explore local amenities around the tour starting point</p>
                    </div>
                    {/* Category Filter Select */}
                    <div className="flex gap-1.5 flex-wrap">
                      {['all', 'catering', 'accommodation', 'tourism'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNearbyCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-extrabold border transition-all uppercase tracking-wider cursor-pointer ${
                            nearbyCategory === cat
                              ? 'bg-gold-500 text-white border-gold-500 shadow-sm'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {cat === 'all' ? 'All Spots' : cat === 'catering' ? 'Dining' : cat === 'accommodation' ? 'Lodging' : 'Attractions'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {placesLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <span className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-gold-500 animate-spin" />
                    </div>
                  ) : placesError ? (
                    <p className="text-xs text-rose-500 text-center py-4">{placesError}</p>
                  ) : nearbyPlaces.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">No nearby places found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nearbyPlaces.slice(0, 6).map((place, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-lg select-none shrink-0 border border-slate-100">
                            {place.type?.toLowerCase().includes('hotel') || place.type?.toLowerCase().includes('accommodation') || place.type?.toLowerCase().includes('hostel') ? '🏨' : place.type?.toLowerCase().includes('restaurant') || place.type?.toLowerCase().includes('cafe') || place.type?.toLowerCase().includes('bistro') ? '🍴' : '📍'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-1">
                              <h5 className="font-bold text-slate-700 text-xs truncate">{place.name}</h5>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                                place.openStatus === 'Open' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}>
                                {place.openStatus}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-450 font-bold block mt-0.5 capitalize">{place.type} | ★ {place.rating}</span>
                            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-50">
                              <span className="text-[10px] text-slate-500 font-extrabold">🛣️ {place.distance}</span>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&origin=${tour.startLocation?.latitude},${tour.startLocation?.longitude}&destination=${place.latitude},${place.longitude}&travelmode=driving`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9px] font-extrabold text-gold-600 hover:text-gold-700 flex items-center gap-1 cursor-pointer"
                              >
                                Directions →
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Feedback list */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-base">Traveler Feedbacks ({reviews.length})</h3>
                  {reviews.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center text-xs text-slate-400 italic">
                      No customer reviews submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <ReviewCard key={rev._id} review={rev} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-850 text-xs uppercase tracking-wider">Leave a Review</h4>
                  <div className="flex gap-4 items-center">
                    <span className="text-xs text-slate-500 font-semibold">Rating Score:</span>
                    <select 
                      value={reviewRating} 
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 text-gold-600 font-bold py-1.5 px-3 rounded-lg text-xs"
                    >
                      {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Review headline (e.g. Magnificent experience!)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs text-slate-700 font-medium"
                    required
                  />
                  <textarea
                    rows="3"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Details about hotel boarding, travel itineraries, fondue guides, etc..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs text-slate-700 font-medium"
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-gold-500/10"
                  >
                    Submit Feedback
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Accordion FAQ & Guidelines */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-gold-500" /> Travel Tips & FAQs
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-sm">
              {faqsList.map((faq, idx) => (
                <div key={idx} className="p-4">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center text-xs font-bold text-slate-700 hover:text-gold-500 text-left focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${faqOpen[idx] ? 'rotate-180 text-gold-500' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {faqOpen[idx] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Policy info */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              🛡️ Cancellation & Refund Policy
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Enjoy complete peace of mind. Cancel your reservation up to 72 hours before the departures date for a full 100% refund. Cancellations made inside the 72-hour window incur a standard 25% administrative retention fee.
            </p>
          </div>
        </div>

        {/* Right Side Sticky Card / Widgets */}
        <div className="lg:sticky lg:top-28 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 space-y-6 scrollbar-thin">
          
          {/* Reservation Card */}
          <StickyBookingCard
            tour={tour}
            selectedDeparture={selectedDeparture}
            setSelectedDeparture={setSelectedDeparture}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            numSeats={numSeats}
            setNumSeats={setNumSeats}
            holdLoading={holdLoading}
            onReserve={handleReserveSeats}
            currentDeparture={currentDeparture}
            currentPlan={currentPlan}
          />

          {/* Weather card (coordinate based) */}
          {destinationObj.coordinates && (
            <WeatherCard 
              latitude={destinationObj.coordinates.latitude} 
              longitude={destinationObj.coordinates.longitude} 
              cityName={destinationObj.name}
            />
          )}

          {/* REST Country Information Card */}
          {countryName && (
            <CountryCard countryName={countryName} />
          )}
        </div>
      </div>


    </div>
  );
};

export default TourDetailPage;
