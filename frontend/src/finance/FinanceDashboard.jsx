import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  DollarSign, FileSpreadsheet, Percent,
  ArrowDownLeft, CheckCircle2, AlertOctagon,
  Check, X, TrendingUp, Activity, Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FinanceDashboard = () => {
  const [financeStats, setFinanceStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/finance');
      if (res.data.success) {
        setFinanceStats(res.data.data);
        setPayments(res.data.data.payments || []);
      }
    } catch (err) {
      console.warn('Failed to load financial stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleExportExcel = async () => {
    try {
      const res = await api.get('/reports/finance/export');
      if (res.data.success) {
        toast.success('Spreadsheet compiled successfully!');
        window.open(`https://exploremytrip.onrender.com${res.data.downloadUrl}`);
      }
    } catch (err) {
      toast.error('Failed to export revenue sheet');
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Summary...</div>;

  return (
    <div className="space-y-8">
      {/* Title banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Finance Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Real-time financial status, tax revenues, and payments summary</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-gold-500/10 cursor-pointer border-none"
        >
          <FileSpreadsheet className="w-4 h-4" /> Quick Export Excel
        </button>
      </div>

      {/* Grid widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">Total Revenue</span>
            <strong className="text-2xl block text-slate-800 mt-1 font-extrabold font-sans">${financeStats?.totalSales || 0}</strong>
          </div>
          <div className="p-3 bg-gold-50 rounded-xl text-gold-600"><DollarSign className="w-6 h-6" /></div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">Today's Revenue</span>
            <strong className="text-2xl block text-slate-800 mt-1 font-extrabold font-sans">${financeStats?.todaySales || 0}</strong>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><TrendingUp className="w-6 h-6" /></div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">Monthly Revenue</span>
            <strong className="text-2xl block text-slate-800 mt-1 font-extrabold font-sans">${financeStats?.monthlySales || 0}</strong>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Activity className="w-6 h-6" /></div>
        </div>

        {/* Yearly Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">Yearly Revenue</span>
            <strong className="text-2xl block text-slate-800 mt-1 font-extrabold font-sans">${financeStats?.totalSales || 0}</strong>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Activity className="w-6 h-6" /></div>
        </div>

        {/* Completed Payments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">Completed Payments</span>
            <strong className="text-2xl block text-slate-800 mt-1 font-extrabold font-sans">{financeStats?.completedPaymentsCount || 0}</strong>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Check className="w-6 h-6" /></div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">Pending Payments</span>
            <strong className="text-2xl block text-slate-800 mt-1 font-extrabold font-sans">{financeStats?.pendingPaymentsCount || 0}</strong>
          </div>
          <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600"><Inbox className="w-6 h-6" /></div>
        </div>

        {/* Refund Requests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">Refund Requests</span>
            <strong className="text-2xl block text-slate-800 mt-1 font-extrabold font-sans">{financeStats?.pendingRefundsCount || 0}</strong>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600"><AlertOctagon className="w-6 h-6" /></div>
        </div>

        {/* Approved Refunds */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">Approved Refunds</span>
            <strong className="text-2xl block text-slate-800 mt-1 font-extrabold font-sans">{financeStats?.approvedRefundsCount || 0}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-slate-650"><CheckCircle2 className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Recent Payments table and Payment distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-slate-800 text-sm">Recent Succeeded Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {payments.filter(p => p.status === 'Succeeded').slice(0, 5).map(p => (
                  <tr key={p._id || p.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">{p.user?.name || 'Customer'}</td>
                    <td className="p-3 font-bold text-gold-550">${p.amount}</td>
                    <td className="p-3 text-slate-650 capitalize">{p.gateway}</td>
                    <td className="p-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-left">
          <h3 className="font-extrabold text-slate-800 text-sm">Gateway Distribution</h3>
          <div className="space-y-4 pt-2">
            {financeStats?.paymentMethods?.map(m => (
              <div key={m._id} className="flex justify-between items-center text-xs">
                <div>
                  <strong className="text-slate-850 font-bold block capitalize">{m._id} Gateway</strong>
                  <span className="text-[10px] text-slate-400 block font-semibold">{m.count} Transactions</span>
                </div>
                <strong className="text-slate-850 font-extrabold">${m.total}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
