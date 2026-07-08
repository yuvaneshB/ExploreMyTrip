import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const EmptyState = ({ 
  icon: Icon, 
  title = 'No Results Found', 
  description = 'Try adjusting your search filters or check back later.', 
  actionText, 
  actionUrl,
  onActionClick
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-200 p-16 rounded-3xl text-center text-slate-500 shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-slate-400">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      
      {actionText && (
        actionUrl ? (
          <Link 
            to={actionUrl}
            className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-gold-500/10 inline-block focus:outline-none focus:ring-2 focus:ring-gold-400"
          >
            {actionText}
          </Link>
        ) : (
          <button 
            onClick={onActionClick}
            className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-gold-500/10 focus:outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
          >
            {actionText}
          </button>
        )
      )}
    </motion.div>
  );
};

export default EmptyState;
