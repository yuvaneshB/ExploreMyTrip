import React from 'react';
import { DollarSign, ShieldCheck, CreditCard, Headphones, Bolt, MapPin } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: <DollarSign className="w-6 h-6 text-gold-500" />,
      title: "Best Price Guarantee",
      desc: "Top-tier premium curated travel itineraries priced transparently with zero hidden fees."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-gold-500" />,
      title: "Verified Safe Tours",
      desc: "All tours are fully vetted and strictly audited by local safety and hospitality experts."
    },
    {
      icon: <CreditCard className="w-6 h-6 text-gold-500" />,
      title: "Secure Payments Vault",
      desc: "Integrated with Stripe and Razorpay encrypted gateways to safeguard transaction details."
    },
    {
      icon: <Headphones className="w-6 h-6 text-gold-500" />,
      title: "24/7 Concierge Support",
      desc: "On-call travel advisor services available anytime during your journey to resolve concerns."
    },
    {
      icon: <Bolt className="w-6 h-6 text-gold-500" />,
      title: "Instant Confirmation",
      desc: "Get digital booking confirmation, formal invoices, and e-tickets instantly on payment."
    },
    {
      icon: <MapPin className="w-6 h-6 text-gold-500" />,
      title: "Professional Guides",
      desc: "Handpicked local experts with deep cultural knowledge to enrich your getaways."
    }
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-200/60 py-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col items-center text-center space-y-3">
          <span className="text-[10px] bg-gold-500/10 text-gold-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Our Standards
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Why Select <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-900 to-blue-600 font-black">ExploreMyTrip</span>?
          </h2>
          <p className="text-slate-500 text-xs max-w-md leading-relaxed">
            We deliver true luxury management, secure inventory seat reservations, and premium itinerary details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-200/80 p-7 rounded-3xl flex items-start gap-5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold-500/5 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-gold-500/10 transition-all duration-350 shadow-inner">
                {f.icon}
              </div>
              <div className="text-left space-y-1.5">
                <h3 className="font-extrabold text-base text-slate-800 group-hover:text-gold-500 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
