import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyBookings, cancelBooking, requestRefund } from '../api/bookingApi.js';
import { fetchWeatherByCoords } from '../services/weatherService.js';
import api from '../services/api.js';
import { 
  Calendar, MapPin, Clock, DollarSign, CheckCircle2, 
  AlertCircle, XCircle, Search, Star, CloudSun, Loader, 
  Sparkles, Ticket, Receipt, ChevronRight, Navigation, Camera, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Confirmed, Pending, Cancelled
  const [sortOrder, setSortOrder] = useState('Newest'); // Newest, Oldest, Upcoming
  
  // Weather state
  const [weatherMap, setWeatherMap] = useState({});

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTourForReview, setSelectedTourForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch bookings
  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBookings();
      if (data && data.success) {
        setBookings(data.bookings || []);
      } else {
        setError('Failed to fetch your bookings.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Fetch Weather for Upcoming/Active Bookings
  useEffect(() => {
    if (bookings.length === 0) return;
    
    const fetchWeatherForUpcoming = async () => {
      const weatherData = {};
      const promises = bookings
        .filter(b => b.status !== 'Cancelled' && new Date(b.departureDate) > new Date())
        .slice(0, 3) // Fetch for top 3 upcoming to save requests
        .map(async (booking) => {
          const lat = booking.tour?.latitude || booking.tour?.startLocation?.latitude;
          const lng = booking.tour?.longitude || booking.tour?.startLocation?.longitude;
          if (lat && lng) {
            try {
              const info = await fetchWeatherByCoords(lat, lng);
              weatherData[booking._id] = info;
            } catch (err) {
              console.warn(`Weather fetch failed for booking ${booking._id}:`, err.message);
            }
          }
        });
      
      await Promise.all(promises);
      setWeatherMap(prev => ({ ...prev, ...weatherData }));
    };

    fetchWeatherForUpcoming();
  }, [bookings]);

  // Cancel Booking handler
  const handleCancelClick = async (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) return;

    const isPaid = booking.amountPaid > 0 || ['Fully Paid', 'Deposited'].includes(booking.status);
    
    let reason = '';
    if (isPaid) {
      reason = window.prompt(
        'This is a paid booking. To request cancellation and initiate a refund according to policy, please enter a cancellation reason:'
      );
      if (reason === null) return; // User cancelled prompt
      if (!reason.trim()) {
        toast.error('A cancellation reason is required.');
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    }
    
    const toastId = toast.loading(isPaid ? 'Submitting refund request...' : 'Processing cancellation...');
    try {
      const res = isPaid ? await requestRefund(bookingId, reason) : await cancelBooking(bookingId);
      if (res.success) {
        toast.success(isPaid ? 'Cancellation & Refund request submitted successfully' : 'Booking cancelled successfully', { id: toastId });
        // Update state
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel booking', { id: toastId });
    }
  };

  // Quick Check-in simulation
  const handleQuickCheckIn = (bookingId) => {
    toast.success(`Check-in completed successfully for Booking ID: ${bookingId.substring(0, 8).toUpperCase()}! Digital boarding pass sent.`);
  };

  // Review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim() || !reviewTitle.trim()) {
      toast.error('Please fill in all review details.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        tourId: selectedTourForReview,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        photos: reviewPhotoUrl ? [reviewPhotoUrl] : []
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Review submitted successfully!');
        setShowReviewModal(false);
        setReviewTitle('');
        setReviewComment('');
        setReviewPhotoUrl('');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calculations & Helper Constants
  const getDaysRemaining = (travelDate) => {
    const diff = new Date(travelDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Filters & Sorters pipeline
  const filteredBookings = bookings
    .filter(b => {
      // Search match
      const titleMatch = b.tour?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const idMatch = b._id?.toLowerCase().includes(searchQuery.toLowerCase());
      const destMatch = b.tour?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.tour?.country?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const queryMatch = titleMatch || idMatch || destMatch;

      // Status match
      if (statusFilter === 'All') return queryMatch;
      if (statusFilter === 'Upcoming') {
        return queryMatch && b.status !== 'Cancelled' && new Date(b.departureDate) > new Date();
      }
      if (statusFilter === 'Completed') {
        return queryMatch && b.status !== 'Cancelled' && new Date(b.departureDate) <= new Date();
      }
      if (statusFilter === 'Cancelled') {
        return queryMatch && b.status === 'Cancelled';
      }
      return queryMatch;
    })
    .sort((a, b) => {
      if (sortOrder === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOrder === 'Upcoming') return new Date(a.departureDate) - new Date(b.departureDate);
      return 0;
    });

  // Timeline Steps Calculation
  const getTimelineSteps = (booking) => {
    if (booking.status === 'Cancelled') {
      return [
        { label: 'Booking Confirmed', completed: true, color: 'bg-emerald-500' },
        { label: 'Cancelled', completed: true, color: 'bg-rose-500' }
      ];
    }
    
    const isPaid = booking.status === 'Fully Paid' || booking.status === 'Deposited';
    const isReady = new Date(booking.departureDate) - new Date() < 3 * 24 * 60 * 60 * 1000; // less than 3 days
    const isStarted = new Date(booking.departureDate) <= new Date();
    const isCompleted = new Date(booking.departureDate) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // completed if departed and 3 days elapsed

    return [
      { label: 'Confirmed', completed: true, color: 'bg-emerald-500' },
      { label: 'Paid', completed: isPaid, color: isPaid ? 'bg-emerald-500' : 'bg-slate-300' },
      { label: 'E-Ticket Active', completed: isPaid, color: isPaid ? 'bg-emerald-500' : 'bg-slate-300' },
      { label: 'Ready to Travel', completed: isPaid && isReady, color: (isPaid && isReady) ? 'bg-emerald-500' : 'bg-slate-300' },
      { label: 'Completed', completed: isCompleted, color: isCompleted ? 'bg-emerald-500' : 'bg-slate-300' }
    ];
  };

  // Render skeletons
  const renderCardSkeletons = () => (
    <div className="space-y-6">
      {[1, 2, 3].map(n => (
        <div key={n} className="border border-slate-200 rounded-3xl p-6 bg-white space-y-4 animate-pulse">
          <div className="flex gap-4">
            <div className="bg-slate-200 h-28 w-40 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 font-sans space-y-8 min-h-screen">
      
      {/* Title Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl text-white">
        <div className="space-y-1">
          <span className="bg-gold-500/90 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Client Hub
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <MapPin className="w-7 h-7 text-gold-500 animate-pulse" /> My Bookings Center
          </h1>
          <p className="text-xs text-slate-400 font-semibold">Manage your trips, access E-Tickets, check live weather updates and stay on top of your travel plans.</p>
        </div>
        
        {/* Quick Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tour name, ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white text-slate-200 focus:text-slate-900 border border-white/10 rounded-2xl focus:outline-none transition-all text-xs font-semibold"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Filter and Sort Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['All', 'Upcoming', 'Completed', 'Cancelled'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                statusFilter === filter 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Sort:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-slate-200 text-xs font-bold text-slate-700 bg-slate-55 px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="Newest">Newest Date</option>
            <option value="Oldest">Oldest Date</option>
            <option value="Upcoming">Nearest Departure</option>
          </select>
        </div>
      </div>

      {loading ? (
        renderCardSkeletons()
      ) : error ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-6">
          <AlertCircle className="w-16 h-16 text-rose-500" />
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-800">Connection Interrupted</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">{error}</p>
          </div>
          <button onClick={loadBookings} className="bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer">
            Retry Loading
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-800">No Booking Records Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-semibold">
            You don't have any bookings matching the current filters. Ready for a new experience?
          </p>
          <Link to="/tours" className="bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl">
            Browse Tours
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredBookings.map((booking) => {
            const daysLeft = getDaysRemaining(booking.departureDate);
            const isUpcoming = daysLeft > 0 && booking.status !== 'Cancelled';
            const isCompleted = daysLeft <= 0 && booking.status !== 'Cancelled';
            const weather = weatherMap[booking._id];
            const timelineSteps = getTimelineSteps(booking);

            return (
              <div 
                key={booking._id} 
                className="bg-white border border-slate-225 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative"
              >
                {/* Countdown / Weather header details */}
                {isUpcoming && (
                  <div className="bg-gradient-to-r from-gold-50 to-blue-50/20 px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Sparkles className="w-4 h-4 text-gold-500 animate-spin-slow" />
                      <span>Departing in <strong className="text-gold-600 font-extrabold">{daysLeft} days</strong> ({new Date(booking.departureDate).toLocaleDateString()})</span>
                    </div>

                    {weather ? (
                      <div className="flex items-center gap-2 text-slate-600 bg-white border border-slate-150 px-3 py-1 rounded-full shadow-sm">
                        <span>{weather.conditionIcon}</span>
                        <span>{weather.conditionText}, {weather.temperature}°C at destination</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 animate-pulse">Loading destination forecast...</span>
                    )}
                  </div>
                )}

                {/* Main Card body */}
                <div className="p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center flex-1">
                    {/* Destination Cover photo */}
                    <div className="h-32 w-full sm:w-48 rounded-2xl overflow-hidden shrink-0 bg-slate-100 relative">
                      <img 
                        src={booking.tour?.images?.[0] || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} 
                        alt={booking.tour?.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[8px] font-bold tracking-wider">
                        ID: {booking._id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>

                    {/* Booking metadata */}
                    <div className="space-y-2 text-left font-sans">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{booking.tour?.category?.name || 'Experience'}</span>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          booking.status === 'Cancelled' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                          booking.status === 'Fully Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-black text-slate-850">{booking.tour?.title}</h3>
                      
                      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-450 shrink-0" /> {booking.tour?.location || 'Location not specified'}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-450 shrink-0" /> {new Date(booking.departureDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-450 shrink-0" /> {booking.numSeats} Traveler(s)</span>
                      </div>

                      <div className="text-xs text-slate-500 font-medium">
                        Package Plan: <strong className="text-slate-800">{booking.pricingPlanName}</strong> | Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Booking Pricing Actions */}
                  <div className="flex flex-col items-start lg:items-end gap-3.5 shrink-0 self-stretch lg:self-auto pt-4 lg:pt-0 border-t border-slate-100 lg:border-t-0">
                    <div className="text-left lg:text-right font-sans">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Paid Amount</span>
                      <strong className="text-2xl font-black text-slate-850">${booking.totalAmount}</strong>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full justify-start lg:justify-end">
                      <button
                        onClick={() => navigate(`/bookings/${booking._id}`)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-slate-900/10"
                      >
                        Manage Booking <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {isUpcoming && (
                        <>
                          <button
                            onClick={() => handleQuickCheckIn(booking._id)}
                            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm shadow-gold-500/10"
                          >
                            <Ticket className="w-3.5 h-3.5" /> Quick Check-in
                          </button>
                          <button
                            onClick={() => handleCancelClick(booking._id)}
                            className="px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-100 text-slate-500 hover:text-rose-500 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedTourForReview(booking.tour?._id);
                              setShowReviewModal(true);
                            }}
                            className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Write Review
                          </button>
                          <button
                            onClick={() => navigate(`/tours/${booking.tour?.slug}`)}
                            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
                          >
                            Book Again
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking Lifecycle progress timeline */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col md:flex-row items-center gap-4 justify-between font-sans">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Timeline Stage</span>
                  <div className="flex-1 max-w-xl flex items-center justify-between w-full relative">
                    
                    {/* Background connector bar line */}
                    <div className="absolute top-2 left-0 right-0 h-0.5 bg-slate-250 z-0" />
                    
                    {timelineSteps.map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 relative z-10">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white border-2 border-white shadow-sm font-bold ${
                          step.completed ? step.color : 'bg-slate-200'
                        }`}>
                          {step.completed && '✓'}
                        </div>
                        <span className={`text-[9px] font-bold ${
                          step.completed ? 'text-slate-800' : 'text-slate-400'
                        }`}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal popup */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative space-y-5 animate-scaleUp">
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-850 flex items-center gap-2">
                <Camera className="w-5 h-5 text-gold-600" /> Share Tour Experience
              </h3>
              <button 
                onClick={() => setShowReviewModal(false)} 
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full cursor-pointer transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs font-semibold font-sans">
              
              {/* Stars selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rating Stars</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-slate-250'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Review Title</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience (e.g. Excellent guide, breathtaking view!)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-gold-500/15"
                />
              </div>

              {/* Comment text */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Details Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="4"
                  placeholder="Tell us what you liked, guide feedback, food, pickup service..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-gold-500/15 resize-none"
                />
              </div>

              {/* Photo url link */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Upload Experience Photo (URL Link)</label>
                <input
                  type="text"
                  value={reviewPhotoUrl}
                  onChange={(e) => setReviewPhotoUrl(e.target.value)}
                  placeholder="Paste a photo link (e.g., Unsplash, Cloudinary)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-gold-500/15"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl cursor-pointer font-bold shadow-lg shadow-gold-500/10 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingReview ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyBookingsPage;
