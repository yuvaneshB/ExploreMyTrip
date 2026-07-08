import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Download, FileText, Activity } from 'lucide-react';

export const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [financeStats, setFinanceStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get('/reports/finance');
        if (res.data.success) {
          setInvoices(res.data.data.invoices || []);
          setFinanceStats(res.data.data);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Invoices...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Billing Invoices</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold font-sans">Invoice directories with corresponding checkout values</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-455 block">Gross Invoiced Sum</span>
            <strong className="text-xl block text-slate-800 mt-0.5 font-bold">${financeStats?.totalInvoiced || 0}</strong>
          </div>
          <FileText className="w-6 h-6 text-gold-500" />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-455 block">Invoices Released</span>
            <strong className="text-xl block text-slate-800 mt-0.5 font-bold">{financeStats?.totalInvoicesCount || 0}</strong>
          </div>
          <Activity className="w-6 h-6 text-blue-500" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Gross Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">PDF Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {invoices.map(inv => (
                <tr key={inv.invoiceNumber || inv.number} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-800">{inv.invoiceNumber || inv.number}</td>
                  <td className="p-4 text-slate-650">{inv.booking?._id || inv.booking}</td>
                  <td className="p-4 font-bold text-slate-800">${inv.totalAmount || inv.total}</td>
                  <td className="p-4"><span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">{inv.status}</span></td>
                  <td className="p-4">
                    <button
                      onClick={() => window.open(`https://exploremytrip.onrender.com${inv.pdfPath || inv.path}`)}
                      className="flex items-center gap-1.5 hover:text-gold-600 transition-colors text-slate-500 font-semibold cursor-pointer border-none bg-transparent"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
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

export default InvoicesPage;
