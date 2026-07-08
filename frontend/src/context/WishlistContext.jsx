import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to load local storage wishlist (primarily for offline fallback or migration)
  const getLocalWishlist = () => {
    try {
      const stored = localStorage.getItem('localWishlist');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  // Helper to save local storage wishlist
  const saveLocalWishlist = (items) => {
    try {
      localStorage.setItem('localWishlist', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save local wishlist:', e);
    }
  };

  // Fetch wishlist from the backend API
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/tours/wishlist');
      if (res.data.success) {
        const tours = res.data.data || res.data.wishlist || [];
        setWishlist(tours);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.warn('Backend wishlist fetch failed. Falling back to local storage.');
      }
      setWishlist(getLocalWishlist());
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sync local storage wishlist to the backend on login
  const syncWithBackend = useCallback(async () => {
    if (!user) return;
    const local = getLocalWishlist();
    if (local.length === 0) return;

    const remainingLocal = [];
    for (const tour of local) {
      const id = tour._id || tour.id || tour;
      try {
        await api.post('/tours/wishlist', { tourId: id });
      } catch (e) {
        // If it's a 404, the tour does not exist anymore, so we don't retry it.
        // For other errors (e.g. network failure), we might want to keep it to retry later.
        if (e.response?.status !== 404) {
          remainingLocal.push(tour);
        }
        console.warn(`Failed to sync tour ${id} with backend:`, e.message);
      }
    }

    if (remainingLocal.length > 0) {
      saveLocalWishlist(remainingLocal);
    } else {
      localStorage.removeItem('localWishlist');
    }
    fetchWishlist();
  }, [user, fetchWishlist]);

  // Fetch or sync whenever user authentication state changes and auth initialization completes
  useEffect(() => {
    if (authLoading) return; // Wait until AuthContext finishes validating session

    fetchWishlist();
    if (user) {
      syncWithBackend();
    } else {
      setWishlist([]); // clear wishlist state immediately on logout
    }
  }, [user, authLoading, fetchWishlist, syncWithBackend]);

  const toggleWishlist = async (tour) => {
    if (!tour) return false;
    const tourId = tour._id || tour.id || (typeof tour === 'string' ? tour : '');

    if (!user) {
      toast.error('Please login to save destinations.');
      return { success: false, redirect: true };
    }

    const exists = wishlist.some(t => (t._id || t.id || t) === tourId);
    setLoading(true);

    // Optimistic UI update: instantly update the frontend state
    const previousWishlist = [...wishlist];
    if (exists) {
      setWishlist(prev => prev.filter(t => (t._id || t.id || t) !== tourId));
    } else {
      setWishlist(prev => [...prev, tour]);
    }

    try {
      if (exists) {
        // Remove from wishlist
        const res = await api.delete(`/tours/wishlist/${tourId}`);
        if (res.data.success) {
          toast.success('Removed from Wishlist');
          fetchWishlist(); // retrieve final server-synced state
          return { success: true, added: false };
        }
      } else {
        // Add to wishlist
        const res = await api.post('/tours/wishlist', { tourId });
        if (res.data.success) {
          toast.success('Added to Wishlist');
          fetchWishlist(); // retrieve final server-synced state
          return { success: true, added: true };
        }
      }
    } catch (err) {
      // Revert optimistic update on failure
      setWishlist(previousWishlist);
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
    return { success: false };
  };

  const removeWishlist = async (tourId) => {
    if (!user) {
      toast.error('Please login to save destinations.');
      return;
    }

    setLoading(true);
    // Optimistic UI update: instantly update the frontend state
    const previousWishlist = [...wishlist];
    setWishlist(prev => prev.filter(t => (t._id || t.id || t) !== tourId));

    try {
      const res = await api.delete(`/tours/wishlist/${tourId}`);
      if (res.data.success) {
        toast.success('Removed from Wishlist');
        fetchWishlist();
      }
    } catch (err) {
      setWishlist(previousWishlist);
      toast.error('Failed to remove from wishlist');
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!user) return;
    setLoading(true);
    const previousWishlist = [...wishlist];
    setWishlist([]);

    try {
      for (const item of previousWishlist) {
        const id = item._id || item.id || item;
        await api.delete(`/tours/wishlist/${id}`);
      }
      toast.success('Wishlist cleared');
      fetchWishlist();
    } catch (err) {
      setWishlist(previousWishlist);
      toast.error('Failed to clear wishlist');
    } finally {
      setLoading(false);
    }
  };

  const isStarred = (tourId) => {
    return wishlist.some(t => (t._id || t.id || t) === tourId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCounter: wishlist.length,
      loading,
      toggleWishlist,
      removeWishlist,
      clearWishlist,
      isStarred,
      refresh: fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
};
