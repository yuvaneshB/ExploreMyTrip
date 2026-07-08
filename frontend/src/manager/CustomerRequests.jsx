import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export const CustomerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/reports/refunds');
        if (res.data.success) {
          setRequests(res.data.refunds || []);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Customer Requests...</div>;

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Customer Requests</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">Review passenger cancellation, refund applications, and operational complaints</p>
      </div>

      <div className="space-y-6">
        {requests.length === 0 ? (
          <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl p-10 bg-white text-xs font-semibold">
            No customer inquiries or cancellation applications filed yet.
          </div>
        ) : (
          requests.map(r => (
            <div key={r._id} className="p-6 bg-white border border-slate-200 rounded-3xl text-xs space-y-3 shadow-sm text-left font-semibold">
              <div className="flex justify-between items-start">
                <div>
                  <strong className="text-slate-800 block">Customer: {r.user?.name} ({r.user?.email})</strong>
                  <span className="text-[10px] text-slate-500 block mt-1">Requested Sum: ${r.refundAmount}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] border font-bold ${r.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  {r.status}
                </span>
              </div>
              <p className="text-slate-500 italic mt-2">"Reason: {r.reason}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerRequests;
