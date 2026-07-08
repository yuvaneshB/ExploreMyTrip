import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const ErrorState = ({ 
  message = 'An unexpected error occurred while fetching information.', 
  onRetry, 
  title = 'Connection Alert' 
}) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-slate-200 p-10 rounded-3xl text-center text-slate-500 shadow-lg max-w-md mx-auto my-10 space-y-6"
    >
      <div className="flex justify-center">
        {isOffline ? (
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <WifiOff className="w-7 h-7" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-7 h-7" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-800">
          {isOffline ? 'Offline Mode Active' : title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed px-2">
          {isOffline 
            ? 'It looks like you are not connected to the internet. Please check your network cables or Wi-Fi settings.' 
            : message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-gold-500 hover:bg-gold-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-md shadow-gold-500/10 focus:outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try Reconnecting
        </button>
      )}
    </motion.div>
  );
};

export default ErrorState;
