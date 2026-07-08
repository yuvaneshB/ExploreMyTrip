import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ActiveFilterChips = ({ filters, categories, onRemove }) => {
  const {
    search,
    category,
    country,
    city,
    priceMax,
    durationMax,
    rating,
    difficulty,
    availability
  } = filters;

  // Compile active chips data
  const activeChips = [];

  if (search) {
    activeChips.push({ key: 'search', label: `Search: "${search}"` });
  }

  if (category) {
    const matchedCategory = categories?.find(c => c._id === category || c.name === category);
    const label = matchedCategory ? matchedCategory.name : category;
    activeChips.push({ key: 'category', label: `Style: ${label}` });
  }

  if (country) {
    activeChips.push({ key: 'country', label: `Country: ${country}` });
  }

  if (city) {
    activeChips.push({ key: 'city', label: `City: ${city}` });
  }

  if (priceMax) {
    activeChips.push({ key: 'priceMax', label: `Max Price: $${priceMax}` });
  }

  if (durationMax) {
    activeChips.push({ key: 'durationMax', label: `Max ${durationMax} Days` });
  }

  if (rating) {
    activeChips.push({ key: 'rating', label: `${rating}★ & Above` });
  }

  if (difficulty) {
    activeChips.push({ key: 'difficulty', label: `Tier: ${difficulty}` });
  }

  if (availability === 'available') {
    activeChips.push({ key: 'availability', label: 'Open seats only' });
  }

  if (activeChips.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Active Filters ({activeChips.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence>
          {activeChips.map((chip) => (
            <motion.div
              key={chip.key}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1 bg-gold-50 border border-gold-150 px-2.5 py-1 rounded-xl text-gold-700 text-[10px] font-bold shadow-sm"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={() => onRemove(chip.key)}
                className="text-gold-500 hover:text-gold-800 transition-colors p-0.5 rounded-full hover:bg-gold-100 cursor-pointer flex items-center justify-center"
                aria-label={`Remove filter ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActiveFilterChips;
