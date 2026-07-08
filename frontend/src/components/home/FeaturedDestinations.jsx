import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star, MapPin, ArrowRight } from 'lucide-react';
import WishlistButton from '../WishlistButton.jsx';

const FeaturedDestinations = ({ tours, loading }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div className="space-y-2 text-left">
          <span className="text-[10px] bg-gold-500/10 text-gold-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Trending Holidays
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-900 to-blue-600 font-black">Global Getaways</span>
          </h2>
          <p className="text-slate-500 text-xs">Explore highly-rated premium hand-crafted itineraries curated by travel experts.</p>
        </div>
        <Link 
          to="/tours" 
          className="flex items-center gap-1.5 text-gold-500 hover:text-gold-600 font-bold text-xs uppercase tracking-wider transition-colors duration-200"
        >
          View All Tours <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-50 border border-slate-100 rounded-3xl h-96 animate-pulse" />
          ))}
        </div>
      ) : tours.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl p-10 bg-slate-50 text-xs font-semibold">
          No tours are currently active. Please log in as Manager to publish new tours.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => {
            const basePrice = tour.pricingPlans?.[0]?.price || 0;
            return (
              <div 
                key={tour._id}
                className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] flex flex-col hover:-translate-y-1.5 transition-all duration-350 group relative"
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden shrink-0">
                  <img 
                    src={tour.images?.[0] || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} 
                    alt={tour.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Glass Card Category Badge */}
                  <div className="absolute top-4 left-4 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full text-slate-800 text-[10px] font-bold border border-slate-200/50 shadow-sm uppercase tracking-wide">
                    {tour.category?.name || 'Adventure'}
                  </div>

                  {/* Wishlist Button Placement */}
                  <div className="absolute top-4 right-4 z-10">
                    <WishlistButton tour={tour} />
                  </div>

                  {/* Rating / Review overlay */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-xl text-white text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span>{tour.averageRating} ({tour.numReviews || 0} reviews)</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col gap-4 text-left">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span className="truncate">{tour.city || 'Swiss Alps'}, {tour.country || 'Switzerland'}</span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-800 group-hover:text-gold-500 transition-colors line-clamp-1 leading-tight tracking-wide">
                    {tour.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {tour.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-1">
                    <Calendar className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>{tour.durationDays} Days / {tour.durationDays - 1} Nights</span>
                  </div>

                  {/* Pricing / Booking Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">From</span>
                      <strong className="text-xl text-gold-600 font-black">${basePrice}</strong>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Link 
                        to={`/tours/${tour.slug}`}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        Details
                      </Link>
                      <Link 
                        to={`/tours/${tour.slug}`}
                        className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-gold-500/10 hover:shadow-gold-500/20"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FeaturedDestinations;
