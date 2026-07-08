import React from 'react';

/**
 * Premium Pulsing Skeleton loaders to enhance perceived loading speed.
 */
export const CardSkeleton = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[420px] animate-pulse">
      {/* Thumbnail */}
      <div className="h-52 bg-slate-200 pulse-glow w-full" />

      {/* Info Block */}
      <div className="p-6 flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-1/5" />
        </div>
        <div className="h-6 bg-slate-200 rounded w-4/5 mt-2" />
        <div className="space-y-2 mt-1">
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-5/6" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <div className="space-y-1">
            <div className="h-2 bg-slate-200 rounded w-12" />
            <div className="h-5 bg-slate-200 rounded w-16" />
          </div>
          <div className="h-8 bg-slate-200 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
};

export const ListingPageSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 w-full">
      {Array(count).fill(0).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const DetailPageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-pulse space-y-10">
      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] rounded-3xl bg-slate-200 pulse-glow" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Detail Body */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="h-10 bg-slate-200 rounded w-3/4" />
            <div className="flex gap-4">
              <div className="h-6 bg-slate-200 rounded-full w-24" />
              <div className="h-6 bg-slate-200 rounded-full w-32" />
              <div className="h-6 bg-slate-200 rounded-full w-28" />
            </div>
            <div className="h-20 bg-slate-200 rounded w-full mt-4" />
          </div>
          <div className="h-44 bg-slate-100 rounded-3xl border border-slate-200 w-full" />
        </div>

        {/* Sidebar */}
        <div className="h-[480px] bg-slate-100 rounded-3xl border border-slate-200 w-full" />
      </div>
    </div>
  );
};

const LoadingSkeleton = {
  Card: CardSkeleton,
  Listing: ListingPageSkeleton,
  Detail: DetailPageSkeleton
};

export default LoadingSkeleton;
