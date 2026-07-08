import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const TourManagement = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tours');
      if (res.data.success) {
        setTours(res.data.tours || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Tours...</div>;

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Tour Management</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">Verify and moderate tour packages listed across active hubs</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="p-4">Package</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Available Seats</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {tours.map(t => (
                <tr key={t._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800">{t.title}</td>
                  <td className="p-4 text-slate-600 font-semibold">{t.location}</td>
                  <td className="p-4 font-bold text-slate-800">${t.basePrice}</td>
                  <td className="p-4 font-semibold text-slate-500">{t.availableSeats}</td>
                  <td className="p-4">
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded text-[10px]">
                      {t.status || 'Published'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TourManagement;
