import React from 'react';

export const PriceSlider = ({ value, onChange, min = 0, max = 5000, step = 50 }) => {
  const currentVal = value === '' ? max : Number(value);

  return (
    <div className="space-y-3 font-sans">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">Budget Range</span>
        <strong className="text-gold-600 font-bold bg-gold-50 px-2 py-0.5 rounded border border-gold-100">
          Up to ${currentVal.toLocaleString()}
        </strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentVal}
        onChange={(e) => onChange(e.target.value === max.toString() ? '' : e.target.value)}
        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-gold-500 hover:accent-gold-600 transition-colors"
      />
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>${min}</span>
        <span>${max.toLocaleString()}+</span>
      </div>
    </div>
  );
};

export default PriceSlider;
