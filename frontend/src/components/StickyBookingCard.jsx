import React from 'react';
import { Calendar, Star, MapPin, Plus, Minus, ArrowRight, AlertCircle } from 'lucide-react';

export const StickyBookingCard = ({
  tour,
  selectedDeparture,
  setSelectedDeparture,
  selectedPlan,
  setSelectedPlan,
  numSeats,
  setNumSeats,
  holdLoading,
  onReserve,
  currentDeparture,
  currentPlan
}) => {
  return (
    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-lg space-y-6 font-sans w-full">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="font-bold text-xl text-slate-800">
          Book This Escape
        </h3>
        <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">Real-time seat reservations</span>
      </div>

      {/* Departures Selection */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Select Departure Date
        </label>
        <select
          value={selectedDeparture}
          onChange={(e) => setSelectedDeparture(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs cursor-pointer text-slate-700 font-semibold"
        >
          {tour.departures?.length > 0 ? (
            tour.departures.map((dep, idx) => (
              <option 
                key={idx} 
                value={dep.date}
                disabled={dep.availableSeats <= 0}
              >
                {new Date(dep.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({dep.availableSeats} seats left)
              </option>
            ))
          ) : (
            <option value="" disabled>No departures scheduled</option>
          )}
        </select>
      </div>

      {/* Pricing Plans */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Pricing Plan Tier
        </label>
        <div className="space-y-2.5">
          {tour.pricingPlans?.map((plan, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedPlan(plan.name)}
              className={`p-4 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${
                selectedPlan === plan.name 
                  ? 'border-gold-500 bg-gold-500/5 ring-1 ring-gold-500/20' 
                  : 'border-slate-200 bg-slate-50 hover:border-slate-350'
              }`}
            >
              <div>
                <strong className={`text-xs block ${selectedPlan === plan.name ? 'text-gold-500' : 'text-slate-800'}`}>
                  {plan.name} Tier
                </strong>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{plan.description}</span>
              </div>
              <span className="text-sm font-bold text-slate-800">${plan.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quantity Select */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Number of Seats
        </label>
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2 rounded-2xl">
          <button
            type="button"
            onClick={() => setNumSeats(prev => Math.max(1, prev - 1))}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-slate-800">{numSeats}</span>
          <button
            type="button"
            onClick={() => {
              const max = currentDeparture?.availableSeats || 10;
              setNumSeats(prev => Math.min(max, prev + 1));
            }}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pricing Summary */}
      {currentPlan && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-400 font-semibold">
          <div className="flex justify-between">
            <span>Rate per seat:</span>
            <span className="text-slate-700">${currentPlan.price}</span>
          </div>
          <div className="flex justify-between">
            <span>Seats multiplier:</span>
            <span className="text-slate-700">x {numSeats}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800">
            <span>Estimated total:</span>
            <span className="text-gold-500 text-sm font-extrabold">${currentPlan.price * numSeats}</span>
          </div>
        </div>
      )}

      {/* Submit Reserve */}
      <button
        onClick={onReserve}
        disabled={holdLoading || !selectedDeparture}
        className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-gold-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {holdLoading ? 'Holding Seats...' : 'Reserve & Lock Seats'} <ArrowRight className="w-4 h-4" />
      </button>
      <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1.5 font-medium">
        <AlertCircle className="w-3.5 h-3.5 text-gold-500" /> 15 Minute Inventory hold starts instantly.
      </p>
    </div>
  );
};

export default StickyBookingCard;
