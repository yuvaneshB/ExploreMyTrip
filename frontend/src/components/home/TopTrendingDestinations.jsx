import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import DestinationCard from './DestinationCard.jsx';
import TrendingSkeleton from './TrendingSkeleton.jsx';

const TopTrendingDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get('/destinations/trending');
        if (res.data.success) {
          setDestinations(res.data.destinations.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load trending destinations:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 font-sans">
      {/* Title Header */}
      <div className="flex flex-col items-center text-center space-y-3 mb-12">
        <span className="text-[10px] bg-gold-500/10 text-gold-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
          Incredible India
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-none">
          Top Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-800 to-blue-600 font-black">Indian Destinations</span>
        </h2>
        <p className="text-slate-500 text-xs max-w-lg leading-relaxed">
          Explore India's most breathtaking and popular tourist spots — from snow-capped Himalayas to sun-kissed beaches.
        </p>
      </div>

      {/* Grid / Slider Container */}
      {loading ? (
        <TrendingSkeleton />
      ) : destinations.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl p-10 bg-slate-50 text-xs font-semibold">
          No trending destinations found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {destinations.map((dest) => (
            <DestinationCard key={dest.name} dest={dest} />
          ))}
        </div>
      )}
    </section>
  );
};

export default React.memo(TopTrendingDestinations);
