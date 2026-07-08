import React from 'react';
import { Star, CornerDownRight } from 'lucide-react';

export const ReviewCard = ({ review }) => {
  const { user, rating, title, comment, createdAt, managerReply } = review;

  const renderStars = (count) => {
    return (
      <div className="flex gap-1.5 text-amber-400 select-none">
        {Array(5).fill(0).map((_, idx) => (
          <Star 
            key={idx} 
            className={`w-3.5 h-3.5 ${idx < count ? 'fill-current' : 'text-slate-200'}`} 
          />
        ))}
      </div>
    );
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  return (
    <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 font-sans shadow-sm hover:border-slate-300 transition-colors duration-200">
      {/* Review Author Details */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user?.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gold-500/10 text-gold-600 flex items-center justify-center font-bold text-xs border border-gold-100">
              {getInitials(user?.name)}
            </div>
          )}
          <div>
            <strong className="text-xs text-slate-800 block font-bold leading-tight">{user?.name || 'Anonymous traveler'}</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
        {renderStars(rating)}
      </div>

      {/* Review Body */}
      <div className="space-y-1">
        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{comment}</p>
      </div>

      {/* Manager Reply Block */}
      {managerReply && (
        <div className="pl-4 border-l-2 border-gold-500/50 mt-4 text-[11px] text-slate-600 bg-slate-100/60 p-4 rounded-r-2xl flex gap-2.5">
          <CornerDownRight className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <strong className="text-gold-600 font-bold block">Response from agency:</strong>
            <p className="leading-relaxed text-slate-500">{managerReply.text || managerReply}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
