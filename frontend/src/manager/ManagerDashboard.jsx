import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { 
  BarChart3, Compass, ShieldAlert, Check, X, AlertOctagon,
  Calendar, Star, Users, MapPin, ClipboardList, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ManagerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
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

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Operations Dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Title banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm text-left">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Manager Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Operational control panel, tour states, and customer requests</p>
        </div>
      </div>

      {/* Grid widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Total Tours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Tours</span>
            <strong className="text-2xl block text-slate-850 mt-1 font-extrabold">{analytics?.totalTours || 0}</strong>
          </div>
          <div className="p-3 bg-gold-50 rounded-xl text-gold-650"><Compass className="w-5 h-5" /></div>
        </div>

        {/* Published Tours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Published Tours</span>
            <strong className="text-2xl block text-slate-850 mt-1 font-extrabold">{analytics?.publishedTours || 0}</strong>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Check className="w-5 h-5" /></div>
        </div>

        {/* Pending Tours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Tours</span>
            <strong className="text-2xl block text-slate-850 mt-1 font-extrabold">{analytics?.pendingTours || 0}</strong>
          </div>
          <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600"><AlertOctagon className="w-5 h-5" /></div>
        </div>

        {/* Upcoming Tours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Upcoming Tours</span>
            <strong className="text-2xl block text-slate-850 mt-1 font-extrabold">{analytics?.upcomingTours || 0}</strong>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Calendar className="w-5 h-5" /></div>
        </div>

        {/* Today's Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Today's Bookings</span>
            <strong className="text-2xl block text-slate-850 mt-1 font-extrabold">{analytics?.todayBookings || 0}</strong>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><TrendingUp className="w-5 h-5" /></div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Bookings</span>
            <strong className="text-2xl block text-slate-850 mt-1 font-extrabold">{analytics?.activeBookings || 0}</strong>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Check className="w-5 h-5" /></div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Requests</span>
            <strong className="text-2xl block text-slate-850 mt-1 font-extrabold">{analytics?.pendingRequests || 0}</strong>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600"><AlertOctagon className="w-5 h-5" /></div>
        </div>

        {/* Customer Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Customer Reviews</span>
            <strong className="text-2xl block text-slate-850 mt-1 font-extrabold">{analytics?.totalReviews || 0}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-slate-600"><Star className="w-5 h-5" /></div>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Average Rating</span>
            <strong className="text-2xl block text-slate-850 mt-1 font-extrabold">{analytics?.avgRating || 4.5} ★</strong>
          </div>
          <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600"><Star className="w-5 h-5" /></div>
        </div>
      </div>

      {/* Top destinations lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-left">
          <h3 className="font-extrabold text-slate-800 text-sm">Top Trending Destinations</h3>
          <div className="space-y-4 pt-2">
            {analytics?.topDestinations?.map((d, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-850">{d.title}</span>
                <span className="font-semibold text-slate-500">{d.seatsBooked} seats booked</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-left">
          <h3 className="font-extrabold text-slate-800 text-sm">Operational Activity Logs</h3>
          <div className="space-y-3 pt-2 text-[11px] font-semibold text-slate-500 leading-normal">
            <p>✓ Tour Swiss Alps status checked and updated.</p>
            <p>✓ Paris Summer package created by Agent verified.</p>
            <p>✓ Refund authorization request routed to Finance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
