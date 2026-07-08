import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Operational Reports...</div>;

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Operational Reports</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold font-sans">Operational occupancy statistics and summaries</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-left font-semibold">
        <h3 className="font-extrabold text-slate-800 text-sm">Key Tour Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2 text-xs">
          <div className="border border-slate-150 p-5 rounded-2xl">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Tours Created</span>
            <strong className="text-slate-850 font-bold mt-0.5 block">{analytics?.totalTours || 0}</strong>
          </div>
          <div className="border border-slate-150 p-5 rounded-2xl">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Bookings Completed</span>
            <strong className="text-slate-850 font-bold mt-0.5 block">{analytics?.totalBookings || 0}</strong>
          </div>
          <div className="border border-slate-150 p-5 rounded-2xl">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Operational Inquiries Queue</span>
            <strong className="text-slate-850 font-bold mt-0.5 block">{analytics?.pendingRequests || 0}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
