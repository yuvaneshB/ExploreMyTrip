import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import WishlistButton from '../WishlistButton.jsx';
import PremiumTravelImage from './PremiumTravelImage.jsx';


export const DestinationGrid = ({ results = [], handleBookNow }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
      {results.map((item) => (
        <div 
          key={item.id}
          className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg flex flex-col hover:border-slate-350 transition-all duration-300 group relative select-none w-full"
        >
          {/* Header Image Gallery */}
          <div className="relative h-48 overflow-hidden bg-slate-100">
            <PremiumTravelImage 
              src={item.image} 
              alt={item.name} 
              className="group-hover:scale-105"
              category={item.category}
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-gold-600 text-[9px] font-bold border border-slate-200 shadow-sm uppercase tracking-wide">
              {item.category || 'Sightseeing'}
            </div>
            
            {/* Heart Wishlist Overlay */}
            <div className="absolute top-3 right-3 z-20">
              <WishlistButton tour={item} />
            </div>
          </div>

          {/* Description Body */}
          <div className="p-5 flex-1 flex flex-col gap-3 font-sans">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              <span className="flex items-center gap-1 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg">
                {item.duration || 'Flexible'}
              </span>
              <span className="flex items-center gap-0.5 text-amber-500 bg-amber-50/50 border border-amber-100/50 px-2 py-0.5 rounded-lg">
                ★ {item.rating}
                {item.reviewsCount > 0 && (
                  <span className="text-slate-400 font-medium">({item.reviewsCount})</span>
                )}
              </span>
            </div>

            <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-gold-500 transition-colors line-clamp-1">
              {item.name}
            </h3>
            
            <div className="text-[10px] font-bold text-slate-450 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-350 shrink-0" />
              <span className="truncate">{item.location || 'Location not specified'}</span>
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{item.description}</p>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto gap-2.5">
              <div>
                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">Starts at</span>
                <strong className="text-base text-gold-500 font-extrabold">${item.price}</strong>
              </div>
              <div className="flex gap-1.5">
                <Link 
                  to={`/destinations/details?name=${encodeURIComponent(item.name)}&city=${encodeURIComponent(item.city)}&country=${encodeURIComponent(item.country)}`}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-[10px] font-bold transition-all text-center flex items-center justify-center"
                >
                  View Details
                </Link>
                <button 
                  onClick={() => handleBookNow(item)}
                  className="bg-gold-500 hover:bg-gold-600 text-white px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all shadow-md shadow-gold-500/10 cursor-pointer border-none flex items-center justify-center"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DestinationGrid;
