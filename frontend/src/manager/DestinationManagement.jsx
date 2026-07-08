import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export const DestinationManagement = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/destinations');
      if (res.data.success) {
        setDestinations(res.data.destinations || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Destinations...</div>;

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Destination Management</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">Index of premium destination hubs and regional areas</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="p-4">Name</th>
                <th className="p-4">Region</th>
                <th className="p-4">Description</th>
                <th className="p-4">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {destinations.map(d => (
                <tr key={d._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800">{d.name}</td>
                  <td className="p-4 text-slate-600 font-semibold">{d.city}, {d.country}</td>
                  <td className="p-4 text-slate-500 truncate max-w-xs">{d.description}</td>
                  <td className="p-4 text-slate-700 font-bold">★ {d.rating || 4.7}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DestinationManagement;
