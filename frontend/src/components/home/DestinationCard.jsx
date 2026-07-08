import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Eye, Compass } from 'lucide-react';

import PremiumTravelImage from '../tours/PremiumTravelImage.jsx';

const DestinationCard = ({ dest }) => {
  return (
    <Link 
      to={`/tours?search=${encodeURIComponent(dest.name)}`}
      className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-[0_22px_45px_rgba(0,0,0,0.08)] flex flex-col hover:-translate-y-1.5 transition-all duration-350 group relative w-full aspect-[3/4] select-none cursor-pointer block"
    >
      
      {/* Background/Image wrapper */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900">
        <PremiumTravelImage 
          src={dest.image} 
          alt={`${dest.name} travel destination`} 
          className="group-hover:scale-105 opacity-85"
          category={dest.category}
        />
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent transition-opacity duration-350 opacity-90 group-hover:opacity-95" />
      </div>

      {/* Content wrapper */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-3.5 z-10 text-left">
        
        {/* Rating overlay */}
        <div className="inline-flex self-start bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-lg text-white text-[10px] font-bold items-center gap-1 border border-white/5 shadow-inner">
          <Star className="w-3 h-3 text-amber-400 fill-current" />
          <span>{dest.rating.toFixed(1)} ({dest.reviewsCount})</span>
        </div>

        {/* Destination Details */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[9px] text-gold-400 font-bold uppercase tracking-wider">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{dest.country}</span>
          </div>
          
          <h3 className="text-lg font-black text-white leading-none tracking-wide truncate group-hover:text-gold-300 transition-colors">
            {dest.name}
          </h3>

          <p className="text-[10px] text-white/70 line-clamp-1 leading-normal font-medium italic pt-0.5">
            {dest.tagline}
          </p>
        </div>

        {/* Pricing / CTA actions */}
        <div className="flex items-center justify-between pt-3.5 border-t border-white/10 gap-3">
          <div>
            <span className="text-[8px] text-white/50 uppercase tracking-widest block font-bold">Starts at</span>
            <strong className="text-lg text-gold-400 font-black">${dest.price}</strong>
          </div>

          <span 
            className="bg-white/10 backdrop-blur hover:bg-white hover:text-slate-900 border border-white/15 text-white px-3.5 py-2.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" /> Details
          </span>
        </div>
      </div>

      {/* Hover border highlight */}
      <div className="absolute inset-0 rounded-[2rem] border-2 border-transparent group-hover:border-white/15 pointer-events-none transition-all duration-300" />
    </Link>
  );
};

export default React.memo(DestinationCard);
