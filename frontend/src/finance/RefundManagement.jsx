import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const RefundManagement = () => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [managerComments, setManagerComments] = useState({});
  const [loading, setLoading] = useState(true);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/refunds');
      if (res.data.success) {
        setRefundRequests(res.data.refunds.filter(r => r.status === 'Pending'));
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (refundId, status) => {
    const comments = managerComments[refundId] || '';
    try {
      const res = await api.put(`/reports/refunds/${refundId}/process`, { status, comments });
      if (res.data.success) {
        toast.success(`Refund status updated to: ${status}`);
        setManagerComments({ ...managerComments, [refundId]: '' });
        loadRefunds();
      }
    } catch (err) {
      toast.error('Failed to process refund request');
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Refund Queue...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans font-sans">Refund Requests</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold font-sans font-sans">Audit pending refund claims and process release codes</p>
      </div>

      <div className="space-y-6">
        {refundRequests.length === 0 ? (
          <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl p-10 bg-white text-xs font-semibold">
            No refund requests currently pending audit.
          </div>
        ) : (
          refundRequests.map(r => (
            <div key={r._id} className="p-6 bg-white border border-slate-200 rounded-3xl text-xs space-y-4 shadow-sm text-left">
              <div className="flex justify-between items-start">
                <div>
                  <strong className="text-slate-800 font-bold block">Customer: {r.user?.name} ({r.user?.email})</strong>
                  <span className="text-[10px] text-slate-500 block mt-1">Refund Sum: ${r.refundAmount} | Reason: "{r.reason}"</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] uppercase font-bold text-slate-500">Audit Comments</label>
                <input
                  type="text"
                  placeholder="Add audit comments..."
                  value={managerComments[r._id] || ''}
                  onChange={(e) => setManagerComments({ ...managerComments, [r._id]: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-805 focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleProcessRefund(r._id, 'Approved')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors shadow-sm cursor-pointer border-none"
                >
                  Authorize & Release Refund
                </button>
                <button 
                  onClick={() => handleProcessRefund(r._id, 'Rejected')}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors shadow-sm cursor-pointer border-none"
                >
                  Decline Refund
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RefundManagement;
