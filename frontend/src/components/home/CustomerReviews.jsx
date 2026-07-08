import React from 'react';
import { Star } from 'lucide-react';

const CustomerReviews = () => {
  const reviews = [
    {
      name: "Sophia Carter",
      country: "United Kingdom",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      rating: 5,
      comment: "ExploreMyTrip managed our corporate tour of Switzerland. The 15-minute hold feature made organizing bookings for 12 passengers stress-free. Outstanding customer support!"
    },
    {
      name: "Marcus Vance",
      country: "Australia",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      rating: 5,
      comment: "Absolutely top-tier! The guides in Tokyo were extremely professional, and download of invoice PDFs and digital boarding passes worked flawlessly. Recommended MERN travel platform."
    },
    {
      name: "Yuki Tanaka",
      country: "Japan",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      rating: 4.8,
      comment: "We booked the Swiss Alps package. Extremely simple checkout flow, fast coupon validations, and robust safety indicators. Looking forward to our next honeymoon booking."
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 font-sans">
      <div className="flex flex-col items-center text-center space-y-3 mb-12">
        <span className="text-[10px] bg-gold-500/10 text-gold-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
          Client Feedback
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
          What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-900 to-blue-600 font-black">Adventurers Say</span>
        </h2>
        <p className="text-slate-500 text-xs max-w-md leading-relaxed">
          Read genuine reviews from verified customers who explored global getaways with our platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((r, i) => (
          <div 
            key={i} 
            className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-[2rem] flex flex-col justify-between hover:shadow-[0_15px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 relative text-left"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-5">
              {[...Array(5)].map((_, idx) => (
                <Star 
                  key={idx} 
                  className={`w-4 h-4 ${idx < Math.floor(r.rating) ? 'text-amber-500 fill-current' : 'text-slate-200'}`} 
                />
              ))}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium italic mb-6 flex-1">
              "{r.comment}"
            </p>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 shrink-0">
              <img 
                src={r.avatar} 
                alt={r.name} 
                className="w-11 h-11 rounded-full object-cover shadow-sm bg-slate-100"
              />
              <div>
                <strong className="text-sm text-slate-800 block font-bold leading-tight">{r.name}</strong>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">{r.country}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CustomerReviews;
