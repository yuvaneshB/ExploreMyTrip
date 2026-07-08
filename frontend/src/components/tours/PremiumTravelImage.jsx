import React, { useState, useEffect } from 'react';

const CATEGORY_FALLBACKS = {};

const GENERAL_FALLBACK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const PremiumTravelImage = ({ src, alt, className = '', category = '' }) => {
  const [imgSrc, setImgSrc] = useState(src || GENERAL_FALLBACK);
  const [loading, setLoading] = useState(!!src);
  const [errorCount, setErrorCount] = useState(0);

  // Sync src changes from props
  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setLoading(true);
      setErrorCount(0);
    } else {
      setImgSrc(GENERAL_FALLBACK);
      setLoading(false);
      setErrorCount(0);
    }
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    const errorFallback = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
    if (errorCount >= 1) {
      setImgSrc(GENERAL_FALLBACK);
      setLoading(false);
      return;
    }
    setErrorCount(prev => prev + 1);
    setImgSrc(errorFallback);
  };

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden select-none">
      {/* Pulse skeleton loading placeholder */}
      {loading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gold-500/25 border-t-gold-500 rounded-full animate-spin" />
        </div>
      )}
      
      {/* High-res image with smooth transition load and zoom */}
      <img
        src={imgSrc}
        alt={alt || 'Luxury Gateway'}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} w-full h-full object-cover transition-all duration-700 ease-in-out ${
          loading ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'
        }`}
        loading="lazy"
      />
    </div>
  );
};

export default PremiumTravelImage;
