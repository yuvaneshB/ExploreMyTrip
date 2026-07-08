import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export const TransactionsPage = () => {
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

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Transactions...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Transaction Log</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold font-sans">Stripe and PayPal gateway transaction settlement records</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Settled Amount</th>
                <th className="p-4">Gateway Status</th>
                <th className="p-4">Settlement Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {payments.map(p => (
                <tr key={p._id || p.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono text-slate-500">{p.transactionId || p.id}</td>
                  <td className="p-4 font-mono text-slate-500">{p.booking?._id || p.booking}</td>
                  <td className="p-4 text-slate-650 font-bold capitalize">{p.gateway}</td>
                  <td className="p-4 font-bold text-slate-850">${p.amount}</td>
                  <td className="p-4 text-emerald-600 font-bold">{p.status}</td>
                  <td className="p-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
