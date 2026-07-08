import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar.jsx';
import { Compass } from 'lucide-react';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2000&q=80', // Paris
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80', // Dubai
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80', // Switzerland
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2000&q=80', // Tokyo
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2000&q=80', // Bali
  'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2000&q=80', // Maldives
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=2000&q=80', // Santorini
  'https://images.unsplash.com/photo-1483168527879-c66136b56105?auto=format&fit=crop&w=2000&q=80'  // Norway
];

const DESTINATIONS = ['Paris', 'Dubai', 'Switzerland', 'Tokyo', 'Bali', 'Maldives', 'Santorini', 'Norway'];

const HeroSection = ({ categories }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[680px] md:h-[750px] flex items-center justify-center text-center px-4 overflow-hidden bg-slate-950">
      {/* Background Images Crossfade */}
      {HERO_IMAGES.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out ${
            idx === currentIdx ? 'opacity-50 scale-100' : 'opacity-0 scale-105'
          }`}
          style={{ backgroundImage: `url('${img}')` }}
        />
      ))}

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/60" />

      {/* Content wrapper */}
      <div className="relative max-w-4xl mx-auto z-10 space-y-8 flex flex-col items-center transform -translate-y-16 md:-translate-y-20">


        {/* Heading */}
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.15] drop-shadow-xl select-none">
          Discover Exquisite <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-blue-400 to-blue-600 font-black">
            {DESTINATIONS[currentIdx]} Getaways
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/80 md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Discover unforgettable destinations, book amazing tours and create memories that last a lifetime.
        </p>

        {/* Global Search Bar */}
        <SearchBar categories={categories} />
      </div>

      {/* Bottom curved transition */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroSection;
