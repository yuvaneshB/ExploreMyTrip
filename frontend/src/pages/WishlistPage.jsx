import React, { useState, useEffect } from 'react';
import { useWishlist } from '../hooks/useWishlist.js';
import { Heart, Trash2, Calendar, Star, ShoppingCart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import api from '../services/api.js';
import WishlistButton from '../components/WishlistButton.jsx';

import PremiumTravelImage from '../components/tours/PremiumTravelImage.jsx';

// Local reusable Destination Card component
const DestinationCard = ({ tour, onRemove }) => {
  const basePrice = tour.pricingPlans?.[0]?.price || 0;
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:border-slate-350 hover:shadow-lg transition-all duration-300 group relative">
      {/* Header Image */}
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <PremiumTravelImage 
          src={tour.image || tour.images?.[0]} 
          alt={tour.title} 
          className="group-hover:scale-105"
          category={tour.category?.name || tour.category}
        />
        {onRemove ? (
          <button 
            onClick={() => onRemove(tour._id)}
            className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-2.5 rounded-full text-rose-500 hover:text-rose-600 border border-slate-200 shadow-sm transition-colors cursor-pointer focus:outline-none z-10"
            aria-label="Remove from wishlist"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute top-4 right-4 z-10">
            <WishlistButton tour={tour} />
          </div>
        )}
        <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-gold-600 text-[10px] font-bold border border-slate-200 shadow-sm uppercase">
          {tour.category?.name || tour.category || 'Escapes'}
        </span>
      </div>

      {/* Body Details */}
      <div className="p-6 flex-1 flex flex-col gap-4 font-sans">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gold-500" /> {tour.durationDays || tour.duration || 1} Days
          </span>
          <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50/50 px-2.5 py-0.5 rounded-md border border-amber-100/50">
            <Star className="w-3 h-3 fill-current inline-block" /> {tour.averageRating || tour.rating || 4.5}
          </span>
        </div>

        <h3 className="font-bold text-base text-slate-800 group-hover:text-gold-500 transition-colors line-clamp-1">
          {tour.title || tour.name}
        </h3>

        <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{tour.location || 'Location not specified'}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Pricing from</span>
            <strong className="text-lg text-gold-500 font-extrabold">${basePrice || tour.price || 0}</strong>
          </div>
          
          <div className="flex gap-2">
            <Link 
              to={`/tours/${tour.slug}`}
              className="text-xs font-bold text-slate-600 hover:text-gold-600 transition-colors py-2 px-3.5 border border-slate-200 rounded-xl hover:border-gold-300 bg-white cursor-pointer inline-flex items-center"
            >
              View Details
            </Link>
            <Link 
              to={`/tours/${tour.slug}`}
              className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-gold-500/10 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-3 h-3" /> Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WishlistPage = () => {
  const { wishlist, loading, removeWishlist, clearWishlist } = useWishlist();
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    if (wishlist.length === 0) {
      api.get('/tours?status=Published')
        .then(res => {
          if (res.data.success) {
            const allTours = res.data.tours || [];
            setPopular(allTours.slice(3, 6));
          }
        })
        .catch(err => console.error('Failed to load suggestions:', err));
    }
  }, [wishlist.length]);

  const handleClear = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      clearWishlist();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans space-y-8">
      {/* Title & Clear Action */}
      <div className="flex justify-between items-center pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 font-sans">
            My Saved <span className="text-gold-gradient font-bold">Wishlist</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">
            Manage your synchronized luxury tour packages ({wishlist.length})
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-rose-500 hover:text-rose-600 font-bold border border-rose-200 bg-rose-50 px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Wishlist
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">
          Loading saved getaways...
        </div>
      ) : wishlist.length === 0 ? (
        <div className="space-y-16">
          <EmptyState 
            icon={Heart} 
            title="❤️ Your Wishlist is Empty" 
            description="You haven't saved any tour packages yet. Explore our luxury escapes catalog and click the heart icon on any package to save it here."
            actionText="Explore Destinations"
            actionUrl="/tours"
          />



          {/* Popular Places */}
          {popular.length > 0 && (
            <div className="space-y-6 pt-8 border-t border-slate-100">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                  Popular Places
                </h2>
                <p className="text-slate-400 text-xs mt-1 font-semibold">
                  Trending destinations loved by travelers worldwide
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popular.map((tour) => (
                  <DestinationCard key={tour._id} tour={tour} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((tour) => (
            <DestinationCard key={tour._id} tour={tour} onRemove={removeWishlist} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
