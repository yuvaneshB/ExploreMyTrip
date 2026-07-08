import React from 'react';
import useCountries from '../hooks/useCountries.js';
import { Globe, Users, Clock, Compass, DollarSign, PhoneCall } from 'lucide-react';

export const CountryCard = ({ countryName }) => {
  const { country, loading, error } = useCountries(countryName);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-pulse space-y-4 font-sans">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-10 bg-slate-200 rounded" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
        <div className="h-32 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center text-xs text-slate-400 italic font-sans">
        Country statistics currently unavailable.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm font-sans space-y-6 w-full">
      {/* Flag & Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
        {country.flag ? (
          <img 
            src={country.flag} 
            alt={`Flag of ${country.name}`} 
            className="w-16 h-10 object-cover rounded shadow-sm border border-slate-150" 
          />
        ) : (
          <div className="w-16 h-10 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-lg shadow-sm">
            🏳️
          </div>
        )}
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-tight">{country.name}</h4>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{country.officialName || 'Country Stats'}</span>
        </div>
      </div>

      {/* Details list */}
      <div className="space-y-3.5 text-xs text-slate-600">
        <div className="flex items-start gap-3">
          <Globe className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Capital City</span>
            <strong className="text-slate-700 font-bold">{country.capital}</strong>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Population</span>
            <strong className="text-slate-700 font-bold">{country.population} residents</strong>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <DollarSign className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Currency</span>
            <strong className="text-slate-700 font-bold">{country.currency}</strong>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Time Zone</span>
            <strong className="text-slate-700 font-bold">{country.timeZone}</strong>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Compass className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Languages</span>
            <strong className="text-slate-700 font-bold block truncate max-w-[200px]" title={country.languages}>
              {country.languages}
            </strong>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <PhoneCall className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Calling Code</span>
            <strong className="text-slate-700 font-bold">{country.callingCode || 'N/A'}</strong>
          </div>
        </div>
      </div>

      {country.mapUrl && (
        <a 
          href={country.mapUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block text-center text-xs font-bold text-gold-500 hover:text-gold-600 bg-slate-50 hover:bg-slate-100 border border-slate-150 py-2.5 rounded-xl transition-all"
        >
          View Country Map Location
        </a>
      )}
    </div>
  );
};

export default CountryCard;
