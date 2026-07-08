import React from 'react';
import LeafletMap from './LeafletMap.jsx';
import { getDirectionsLink, getNearbySearchLink } from '../services/mapsService.js';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';

export const MapCard = ({ startLocation, endLocation, attractions = [], places = [] }) => {
  const mapCenter = startLocation || { latitude: 46.0207, longitude: 7.7491, name: 'Switzerland' };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm font-sans flex flex-col lg:flex-row w-full">
      {/* Interactive Map */}
      <div className="flex-1 min-h-[350px] relative z-10">
        <LeafletMap startLocation={startLocation} endLocation={endLocation} places={places} height="100%" />
      </div>

      {/* Attractions Sidebar */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-150 p-6 flex flex-col gap-6 shrink-0 bg-slate-50/50">
        <div className="pb-3 border-b border-slate-150 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Tour Route Map</h4>
            <span className="text-[10px] text-slate-400 block font-semibold">{mapCenter.name}</span>
          </div>
          <MapPin className="w-5 h-5 text-gold-500" />
        </div>

        {/* Nearby attractions list */}
        {attractions.length > 0 ? (
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nearby Attractions</h5>
            <div className="space-y-2">
              {attractions.map((att, idx) => (
                <a
                  key={idx}
                  href={getNearbySearchLink(mapCenter.latitude, mapCenter.longitude, att)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 bg-white border border-slate-150 rounded-xl text-xs text-slate-600 hover:text-gold-600 hover:border-gold-300 transition-all font-medium group"
                >
                  <span className="truncate max-w-[190px]">{att}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-gold-500 transition-opacity shrink-0" />
                </a>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No attractions listed. Zoom map to see surrounding cities.</p>
        )}

        {/* Directions button */}
        <div className="mt-auto pt-4 border-t border-slate-150">
          <a
            href={getDirectionsLink(mapCenter.latitude, mapCenter.longitude, mapCenter.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md shadow-gold-500/10 transition-all"
          >
            <Navigation className="w-4 h-4 fill-current rotate-45" /> Get Driving Directions
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapCard;
