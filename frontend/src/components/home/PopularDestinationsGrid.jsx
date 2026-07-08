import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PremiumTravelImage from '../tours/PremiumTravelImage.jsx';

const destinations = [
  // Row 1: Paris (wide) + Dubai + Tokyo
  {
    name: 'Paris',
    country: 'France',
    price: '$299',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
    cols: 'col-span-1 md:col-span-2',
    height: 'h-64 md:h-80'
  },
  {
    name: 'Dubai',
    country: 'UAE',
    price: '$199',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    cols: 'col-span-1',
    height: 'h-64 md:h-80'
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    price: '$250',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    cols: 'col-span-1',
    height: 'h-64 md:h-80'
  },
  // Row 2: Maldives + Switzerland (wide)
  {
    name: 'Maldives',
    country: 'Indian Ocean',
    price: '$350',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80',
    cols: 'col-span-1',
    height: 'h-64 md:h-72'
  },
  {
    name: 'Switzerland',
    country: 'Europe',
    price: '$450',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    cols: 'col-span-1 md:col-span-3',
    height: 'h-64 md:h-72'
  }
];

const DestCard = ({ d, onClick }) => (
  <div
    onClick={() => onClick(d.name)}
    className={`${d.cols} ${d.height} relative rounded-[1.75rem] overflow-hidden group cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
  >
    {/* Image */}
    <PremiumTravelImage
      src={d.image}
      alt={d.name}
      className="group-hover:scale-105"
      category="sightseeing"
    />
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

    {/* Content */}
    <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between text-white z-10">
      <div className="space-y-0.5">
        <span className="text-[9px] uppercase tracking-widest font-extrabold text-gold-400 block">
          {d.country}
        </span>
        <h3 className="text-lg font-black tracking-wide leading-tight">{d.name}</h3>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline text-[10px] font-semibold bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
          From <strong className="text-gold-400 font-extrabold">{d.price}</strong>
        </span>
        <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200 shrink-0">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>

    {/* Hover border highlight */}
    <div className="absolute inset-0 rounded-[1.75rem] border-2 border-transparent group-hover:border-white/15 pointer-events-none transition-all duration-300" />
  </div>
);

const PopularDestinationsGrid = () => {
  const navigate = useNavigate();
  const handleDestClick = (term) => navigate(`/tours?search=${encodeURIComponent(term)}`);

  const row1 = destinations.slice(0, 3); // Paris(2col) + Dubai(1col) + Tokyo(1col) = 4cols
  const row2 = destinations.slice(3, 5); // Maldives(1col) + Switzerland(3cols) = 4cols

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 font-sans">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center space-y-3 mb-12">
        <span className="text-[10px] bg-gold-500/10 text-gold-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
          Top Localities
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
          Explore Popular{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-900 to-blue-600 font-black">
            Global Hubs
          </span>
        </h2>
        <p className="text-slate-500 text-xs max-w-md leading-relaxed">
          Discover handpicked destinations with direct departures and complete local hospitality guides.
        </p>
      </div>

      {/* Mosaic Grid — 2 rows, each a 4-column grid */}
      <div className="flex flex-col gap-5">
        {/* Row 1: Paris spans 2 cols, Dubai & Tokyo each 1 col */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-stretch">
          {row1.map((d, i) => (
            <DestCard key={i} d={d} onClick={handleDestClick} />
          ))}
        </div>

        {/* Row 2: Maldives 1 col, Switzerland spans 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-stretch">
          {row2.map((d, i) => (
            <DestCard key={i} d={d} onClick={handleDestClick} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinationsGrid;
