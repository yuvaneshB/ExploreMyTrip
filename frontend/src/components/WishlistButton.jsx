import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '../hooks/useWishlist.js';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const WishlistButton = ({ tour, className = '' }) => {
  const { isStarred, toggleWishlist, wishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const tourId = tour?._id || tour?.id || (typeof tour === 'string' ? tour : '');

  const starred = isStarred(tourId) || wishlist.some(t => {
    const itemId = t._id || t.id || t;
    if (tour?.name && t?.title) {
      return tour.name.toLowerCase() === t.title.toLowerCase();
    }
    return tourId === itemId;
  });

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to save destinations.');
      navigate('/login');
      return;
    }

    if (loading) return;
    
    setLoading(true);
    try {
      let tourToToggle = tour;
      // If the tour item is a dynamic search result, ensure it in the database first
      if (tour && (!tour._id || !tour.isLocal || String(tour.id).startsWith('dynamic_'))) {
        const res = await api.post('/destinations/ensure', {
          name: tour.name,
          country: tour.country,
          city: tour.city,
          category: tour.category,
          image: tour.image,
          rating: tour.rating,
          price: tour.price,
          duration: tour.duration,
          description: tour.description,
          coordinates: tour.coordinates
        });
        if (res.data.success) {
          tourToToggle = { _id: res.data.tourId };
        }
      }
      await toggleWishlist(tourToToggle);
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleToggle}
      aria-label={starred ? "Remove tour from wishlist" : "Add tour to wishlist"}
      disabled={loading}
      className={`p-2.5 rounded-full bg-white/95 backdrop-blur-sm border shadow-sm flex items-center justify-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-400 ${
        starred 
          ? 'border-rose-100 text-rose-500 hover:bg-rose-50' 
          : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-slate-50'
      } ${className}`}
    >
      <Heart 
        className={`w-4 h-4 transition-transform ${starred ? 'fill-current scale-110 text-rose-500' : ''} ${loading ? 'animate-pulse' : ''}`} 
      />
    </motion.button>
  );
};

export default WishlistButton;
