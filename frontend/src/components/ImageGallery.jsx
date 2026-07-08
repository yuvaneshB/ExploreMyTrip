import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const ImageGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const list = images.filter(img => img && !img.includes('unsplash.com'));

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? list.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === list.length - 1 ? 0 : prev + 1));
  };

  if (list.length === 0) {
    return (
      <div className="h-[450px] w-full bg-slate-100 rounded-3xl flex items-center justify-center border border-slate-250 font-sans">
        <span className="text-slate-400 text-xs font-semibold">No images available for this tour</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Main Image View */}
      <div 
        onClick={() => setLightboxOpen(true)}
        className="relative h-[450px] w-full bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-200 cursor-zoom-in group"
      >
        <motion.img
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={list[activeIndex]}
          alt={`Tour scenery ${activeIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Carousel controls */}
        {list.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur hover:bg-white text-slate-800 p-2.5 rounded-full shadow border border-slate-100 hover:scale-105 transition-all cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur hover:bg-white text-slate-800 p-2.5 rounded-full shadow border border-slate-100 hover:scale-105 transition-all cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Zoom trigger overlay */}
        <div className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2.5 rounded-full transition-colors">
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>

      {/* Thumbnails Navigation */}
      {list.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {list.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                activeIndex === idx 
                  ? 'border-gold-500 ring-2 ring-gold-500/20 scale-95 shadow' 
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Overlay */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-6"
            onClick={() => setLightboxOpen(false)}
          >
            <button 
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors cursor-pointer border border-white/10 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
              <motion.img
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                src={list[activeIndex]}
                alt="Enlarged view"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />

              {list.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-0 bg-white/15 hover:bg-white/25 text-white p-4 rounded-full border border-white/10 hover:scale-105 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-0 bg-white/15 hover:bg-white/25 text-white p-4 rounded-full border border-white/10 hover:scale-105 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGallery;
