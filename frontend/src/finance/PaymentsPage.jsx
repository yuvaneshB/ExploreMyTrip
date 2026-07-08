import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/reports/finance');
        if (res.data.success) {
          setPayments(res.data.data.payments || []);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Payments...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Booking Payments</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold font-sans">Full directory of booking payment receipts and client records</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="p-4">Payment Ref</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Gross Amount</th>
                <th className="p-4">TAX Collected (15%)</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {payments.map(p => (
                <tr key={p._id || p.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono text-slate-550">{p._id}</td>
                  <td className="p-4 text-slate-700 text-left">
                    <span className="font-bold block text-slate-800">{p.user?.name || 'Customer'}</span>
                    <span className="text-[10px] text-slate-400 block">{p.user?.email}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">${p.amount}</td>
                  <td className="p-4 text-slate-650">${p.taxAmount || Math.round(p.amount * 0.15)}</td>
                  <td className="p-4 capitalize text-slate-600">{p.gateway}</td>
                  <td className="p-4"><span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded text-[10px]">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
