import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Maximize2, Minimize2 } from 'lucide-react';

export const LeafletMap = ({ startLocation, endLocation, places = [], height = '300px' }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const startLat = startLocation?.latitude || 46.0207;
    const startLng = startLocation?.longitude || 7.7491;
    const endLat = endLocation?.latitude;
    const endLng = endLocation?.longitude;

    // Instantiate map if not present
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true
      }).setView([startLat, startLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView([startLat, startLng], 12);
    }

    const map = mapInstanceRef.current;

    // Clean up markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Custom Icon helper
    const createIcon = (color) => L.divIcon({
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
      className: 'custom-leaflet-icon',
      iconSize: [14, 14]
    });

    // Add Start Marker (Amber)
    L.marker([startLat, startLng], { 
      icon: createIcon('#f59e0b') 
    }).addTo(map).bindPopup(`<strong>Start Location</strong><br/>${startLocation?.name || 'Start Point'}`);

    // Add End Marker (Red) and path line if end location is supplied
    if (endLat && endLng) {
      L.marker([endLat, endLng], { 
        icon: createIcon('#ef4444') 
      }).addTo(map).bindPopup(`<strong>End Location</strong><br/>${endLocation.name || 'End Point'}`);

      // Draw path line
      L.polyline([
        [startLat, startLng],
        [endLat, endLng]
      ], { color: '#2563eb', weight: 4, dashArray: '6, 6' }).addTo(map);

      // Fit bounds to show entire path
      const bounds = L.latLngBounds([[startLat, startLng], [endLat, endLng]]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    // Render Nearby Places markers
    if (places && places.length > 0) {
      places.forEach((place) => {
        if (!place.latitude || !place.longitude) return;

        let color = '#a855f7'; // default purple attraction
        const typeStr = place.type?.toLowerCase() || '';
        
        if (typeStr.includes('hotel') || typeStr.includes('accommodation') || typeStr.includes('hostel')) {
          color = '#4f46e5'; // Indigo Hotel
        } else if (typeStr.includes('restaurant') || typeStr.includes('cafe') || typeStr.includes('bistro') || typeStr.includes('dining')) {
          color = '#10b981'; // Emerald dining
        }

        L.marker([place.latitude, place.longitude], {
          icon: createIcon(color)
        }).addTo(map).bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color: #1e293b; font-weight: bold;">${place.name}</strong><br/>
            <span style="color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 9px;">${place.type}</span><br/>
            <span style="color: #f59e0b; font-weight: bold;">★ ${place.rating}</span> | ${place.distance || '0 km'}
          </div>
        `);
      });
    }

    // Trigger map invalidation to handle width transitions smoothly
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Clean up map instance on component unmount
      if (mapInstanceRef.current && !isFullscreen) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [startLocation, endLocation, places, isFullscreen]);

  const toggleFullscreen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFullscreen(prev => !prev);
    
    // Invalidate size immediately after DOM bounds transition
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
  };

  return (
    <div 
      className={`relative rounded-2xl border border-slate-200 overflow-hidden z-10 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen p-4 bg-slate-900/90' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-xl overflow-hidden"
      />
      
      {/* Premium Fullscreen Toggle Button */}
      <button
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
        className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-700 hover:text-slate-900 p-2.5 rounded-xl shadow-md z-30 transition-all duration-200 hover:scale-105 cursor-pointer"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default LeafletMap;
