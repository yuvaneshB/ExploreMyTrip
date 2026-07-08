import React from 'react';

const TrendingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full animate-pulse select-none">
      {[1, 2, 3, 4, 5].map((idx) => (
        <div 
          key={idx} 
          className="bg-slate-100 border border-slate-200/60 rounded-[2rem] h-[400px] w-full flex flex-col justify-end p-5 relative overflow-hidden"
        >
          {/* Skeleton background mimic */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-200 via-transparent to-transparent" />

          {/* Skeleton Card Content */}
          <div className="space-y-3 z-10 w-full">
            <div className="w-16 h-3.5 bg-slate-200 rounded-md" />
            <div className="w-2/3 h-5 bg-slate-200 rounded-md" />
            <div className="w-full h-3 bg-slate-200 rounded-md" />
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
              <div className="space-y-1">
                <div className="w-8 h-2 bg-slate-200 rounded-md" />
                <div className="w-12 h-4 bg-slate-200 rounded-md" />
              </div>
              <div className="w-16 h-8 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrendingSkeleton;
