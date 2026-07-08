import React from 'react';
import { Sparkles, Gift, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SpecialOffers = () => {
  const offers = [
    {
      badge: "Limited Time",
      title: "Summer Getaways Sale",
      description: "Get up to 25% off on European luxury tours. Book by end of this week.",
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
      code: "SUMMER25",
      link: "/tours?search=Europe"
    },
    {
      badge: "Weekend Special",
      title: "Nature & Adventure Deals",
      description: "Flat $150 cashback on mountain hiking trails and nature escape packages.",
      gradient: "from-emerald-600 via-teal-600 to-cyan-600",
      code: "WILD150",
      link: "/tours?search=Alps"
    },
    {
      badge: "Exclusive Launch",
      title: "Ultimate Luxury Retreats",
      description: "Complimentary room upgrades & VIP airport transfers in Dubai & Maldives.",
      gradient: "from-amber-600 via-orange-650 to-rose-600",
      code: "LUXELIFE",
      link: "/tours?search=Dubai"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 font-sans">
      <div className="flex flex-col items-center text-center space-y-3 mb-12">
        <span className="text-[10px] bg-gold-500/10 text-gold-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
          Promotional Campaigns
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
          Special Seasonal <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-900 to-blue-600 font-black">Offers & Deals</span>
        </h2>
        <p className="text-slate-500 text-xs max-w-md">
          Claim verified vouchers and save big on premium hand-crafted travel packages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {offers.map((offer, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${offer.gradient} text-white p-8 rounded-[2rem] shadow-lg flex flex-col justify-between hover:scale-[1.02] hover:shadow-[0_20px_35px_rgba(0,0,0,0.1)] transition-all duration-350 relative overflow-hidden group`}
          >
            {/* Design circle backgrounds */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-black/5 rounded-full group-hover:scale-150 transition-transform duration-500" />

            <div className="space-y-4 text-left z-10">
              <span className="inline-flex items-center gap-1 bg-white/15 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-white/10">
                <Sparkles className="w-3 h-3 text-gold-300" /> {offer.badge}
              </span>
              <h3 className="text-xl font-black leading-tight tracking-wide">
                {offer.title}
              </h3>
              <p className="text-xs text-white/80 leading-relaxed font-medium">
                {offer.description}
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 z-10 pt-4 border-t border-white/10">
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-white/60 font-bold block">Coupon Code</span>
                <span className="text-sm font-black tracking-widest text-gold-300 select-all">{offer.code}</span>
              </div>
              <Link
                to={offer.link}
                className="bg-white hover:bg-gold-450 hover:text-white text-slate-800 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
              >
                Claim <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SpecialOffers;
