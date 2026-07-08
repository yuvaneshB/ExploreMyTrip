import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/moderation');
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateReview = async (reviewId, status) => {
    try {
      const res = await api.put(`/reviews/${reviewId}/moderate`, { status });
      if (res.data.success) {
        toast.success(`Review ${status.toLowerCase()} successfully!`);
        loadReviews();
      }
    } catch (err) {
      toast.error('Failed to moderate review');
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Reviews Moderation...</div>;

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Reviews Moderation</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">Flag reviews, filter spam comments, and moderate client ratings</p>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl p-10 bg-white text-xs font-semibold">
            No pending customer reviews to moderate.
          </div>
        ) : (
          reviews.map(r => (
            <div key={r._id} className="p-6 bg-white border border-slate-200 rounded-3xl text-xs space-y-4 shadow-sm text-left font-semibold">
              <div className="flex justify-between items-start">
                <div>
                  <strong className="text-slate-800 block">{r.user?.name || 'Customer'}</strong>
                  <span className="text-[10px] text-slate-500 block mt-1">Rating: {r.rating} ★ | Status: {r.moderationStatus}</span>
                </div>
              </div>
              <p className="text-slate-600 font-medium">"{r.comment}"</p>
              
              {r.moderationStatus === 'Pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleModerateReview(r._id, 'Approved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer border-none"
                  >
                    Approve Review
                  </button>
                  <button 
                    onClick={() => handleModerateReview(r._id, 'Rejected')}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer border-none"
                  >
                    Flag as Spam / Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
