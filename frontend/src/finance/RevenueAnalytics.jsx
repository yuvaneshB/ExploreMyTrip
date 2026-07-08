import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export const RevenueAnalytics = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/reports/finance');
        if (res.data.success) {
          setChartData(res.data.data.chartData || []);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Analytics...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans font-sans">Revenue Analytics</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold font-sans font-sans">Monthly gross sales trends and performance statistics</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
        <h3 className="font-extrabold text-slate-800 text-sm">Monthly Revenue Trend (12 Months)</h3>
        
        <div className="h-64 flex items-end gap-3 pt-6 border-b border-l border-slate-100 px-4">
          {chartData.map((val, idx) => {
            const maxVal = Math.max(...chartData, 1000);
            const heightPercent = maxVal > 0 ? (val / maxVal) * 100 : 0;
            return (
              <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center gap-2 group cursor-pointer relative">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -translate-y-8 pointer-events-none">${val}</span>
                <div 
                  style={{ height: `${Math.max(5, heightPercent)}%` }} 
                  className="w-full bg-gold-500 hover:bg-gold-600 transition-all rounded-t-lg shadow-sm shadow-gold-500/10" 
                />
                <span className="text-[9px] font-bold text-slate-450 uppercase">{new Date(0, idx).toLocaleString('en', { month: 'short' })}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
