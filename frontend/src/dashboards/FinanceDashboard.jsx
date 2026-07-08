import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import Sidebar from '../components/Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  DollarSign, FileSpreadsheet, Download,
  Percent, ArrowDownLeft, CheckCircle2,
  AlertOctagon, Check, X, BarChart3, List,
  FileText, AlertCircle, User, CreditCard,
  TrendingUp, Activity, Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const FinanceDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'payments', 'transactions', 'invoices', 'refunds', 'reports', 'analytics', 'profile'
  const [financeStats, setFinanceStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [managerComments, setManagerComments] = useState({});
  const [loading, setLoading] = useState(true);

  // Sync tab active state with current location pathname suffix
  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/payments')) {
      setActiveTab('payments');
    } else if (path.endsWith('/transactions')) {
      setActiveTab('transactions');
    } else if (path.endsWith('/invoices')) {
      setActiveTab('invoices');
    } else if (path.endsWith('/refunds')) {
      setActiveTab('refunds');
    } else if (path.endsWith('/reports')) {
      setActiveTab('reports');
    } else if (path.endsWith('/analytics')) {
      setActiveTab('analytics');
    } else if (path.endsWith('/profile')) {
      setActiveTab('profile');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [statsRes, refundsRes] = await Promise.all([
        api.get('/reports/finance'),
        api.get('/reports/refunds')
      ]);

      if (statsRes.data.success) {
        setFinanceStats(statsRes.data.data);
        setPayments(statsRes.data.data.payments || []);
        setInvoices(statsRes.data.data.invoices || []);
      }
      if (refundsRes.data.success) {
        // Show all pending refunds for Financial Officer to process
        setRefundRequests(refundsRes.data.refunds.filter(r => r.status === 'Pending'));
      }
    } catch (err) {
      console.warn('Failed to load financial workspace:', err.message);
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
        loadFinanceData();
      }
    } catch (err) {
      toast.error('Failed to process refund request');
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, [activeTab]);

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

  // Reusable render helper for header banner
  const renderHeaderBanner = (title, subtitle) => (
    <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
      <div>
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800">{title}</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">{subtitle}</p>
      </div>
      <button
        onClick={handleExportExcel}
        className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-gold-500/10 cursor-pointer"
      >
        <FileSpreadsheet className="w-4 h-4" /> Export Excel Sheet
      </button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 font-sans overflow-hidden">
      <Sidebar role="Finance" />

      {/* Main Panel — owns its own scroll */}
      <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto h-full">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">
            Loading Financial Workspace...
          </div>
        ) : (
          <>
            {/* Dashboard Overview Panel */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {renderHeaderBanner("Finance Dashboard", "Real-time auditing dashboard for booking sales, tax metrics, and refund requests")}

                {/* 2x4 Metric Matrix Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Revenue */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Revenue</span>
                      <strong className="text-2xl block text-slate-800 mt-1 font-extrabold">${financeStats?.totalSales || 0}</strong>
                    </div>
                    <div className="p-3 bg-gold-50 rounded-xl text-gold-600"><DollarSign className="w-6 h-6" /></div>
                  </div>

                  {/* Today's Revenue */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Today's Revenue</span>
                      <strong className="text-2xl block text-slate-800 mt-1 font-extrabold">${financeStats?.todaySales || 0}</strong>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><TrendingUp className="w-6 h-6" /></div>
                  </div>

                  {/* Monthly Revenue */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Monthly Revenue</span>
                      <strong className="text-2xl block text-slate-800 mt-1 font-extrabold">${financeStats?.monthlySales || 0}</strong>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Activity className="w-6 h-6" /></div>
                  </div>

                  {/* Net Platform Revenue */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Revenue</span>
                      <strong className="text-2xl block text-slate-800 mt-1 font-extrabold">${financeStats?.netRevenue || 0}</strong>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div>
                  </div>

                  {/* Pending Payments */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Payments</span>
                      <strong className="text-2xl block text-slate-800 mt-1 font-extrabold">{financeStats?.pendingPaymentsCount || 0}</strong>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600"><Inbox className="w-6 h-6" /></div>
                  </div>

                  {/* Completed Payments */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Completed Payments</span>
                      <strong className="text-2xl block text-slate-800 mt-1 font-extrabold">{financeStats?.completedPaymentsCount || 0}</strong>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Check className="w-6 h-6" /></div>
                  </div>

                  {/* Refund Requests */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Refund Requests</span>
                      <strong className="text-2xl block text-slate-800 mt-1 font-extrabold">{financeStats?.pendingRefundsCount || 0}</strong>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl text-rose-600"><AlertOctagon className="w-6 h-6" /></div>
                  </div>

                  {/* Approved Refunds */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Approved Refunds</span>
                      <strong className="text-2xl block text-slate-800 mt-1 font-extrabold">{financeStats?.approvedRefundsCount || 0}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-650"><CheckCircle2 className="w-6 h-6" /></div>
                  </div>
                </div>

                {/* Recent Transactions List inside Dashboard Summary */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 text-sm">Recent Transactions Log</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                          <th className="p-4">Transaction ID</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {payments.slice(0, 5).map(p => (
                          <tr key={p._id || p.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-mono text-slate-500">{p.transactionId || p.id}</td>
                            <td className="p-4 text-slate-600">{p.user?.name || 'Customer'}</td>
                            <td className="p-4 font-bold text-slate-800">${p.amount}</td>
                            <td className="p-4"><span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded text-[9px]">{p.status}</span></td>
                            <td className="p-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Payments Panel */}
            {activeTab === 'payments' && (
              <div className="space-y-8">
                {renderHeaderBanner("Payments Ledger", "Complete booking payments index with corresponding customer details")}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                          <th className="p-4">Payment Ref</th>
                          <th className="p-4">Customer Details</th>
                          <th className="p-4">Gross Amount</th>
                          <th className="p-4">TAX Collected (15%)</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {payments.map(p => (
                          <tr key={p._id || p.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-mono text-slate-550">{p._id}</td>
                            <td className="p-4 text-slate-700">
                              <span className="font-bold block">{p.user?.name || 'System User'}</span>
                              <span className="text-[10px] text-slate-400 block">{p.user?.email}</span>
                            </td>
                            <td className="p-4 font-bold text-slate-800">${p.amount}</td>
                            <td className="p-4 text-slate-600">${p.taxAmount || Math.round(p.amount * 0.15)}</td>
                            <td className="p-4 text-emerald-600 font-semibold">{p.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Panel */}
            {activeTab === 'transactions' && (
              <div className="space-y-8">
                {renderHeaderBanner("Transactions Hub", "Direct gateway logs mapping transaction IDs to local booking references")}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                          <th className="p-4">Transaction ID</th>
                          <th className="p-4">Booking ID</th>
                          <th className="p-4">Gateway</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Processed Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {payments.map(p => (
                          <tr key={p._id || p.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-mono text-slate-500">{p.transactionId || p.id}</td>
                            <td className="p-4 font-mono text-slate-500">{p.booking?._id || p.booking}</td>
                            <td className="p-4 text-slate-600 font-semibold">{p.gateway || 'Stripe'}</td>
                            <td className="p-4 font-bold text-slate-800">${p.amount}</td>
                            <td className="p-4"><span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded text-[9px]">{p.status}</span></td>
                            <td className="p-4 text-slate-550">{new Date(p.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices Panel */}
            {activeTab === 'invoices' && (
              <div className="space-y-8">
                {renderHeaderBanner("Billing Invoices", "Invoice statistics and copies generated dynamically on booking checkouts")}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Total Invoiced</span>
                      <strong className="text-xl block text-slate-800 mt-0.5">${financeStats?.totalInvoiced || 0}</strong>
                    </div>
                    <FileText className="w-6 h-6 text-gold-500" />
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Total Invoices</span>
                      <strong className="text-xl block text-slate-800 mt-0.5">{financeStats?.totalInvoicesCount || 0}</strong>
                    </div>
                    <Activity className="w-6 h-6 text-blue-500" />
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                          <th className="p-4">Invoice #</th>
                          <th className="p-4">Booking Ref</th>
                          <th className="p-4">Total Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Downloads</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {invoices.map(inv => (
                          <tr key={inv.invoiceNumber || inv.number} className="hover:bg-slate-50/50">
                            <td className="p-4 font-mono font-bold text-slate-800">{inv.invoiceNumber || inv.number}</td>
                            <td className="p-4 text-slate-650">{inv.booking?._id || inv.booking || inv.ref}</td>
                            <td className="p-4 font-bold text-slate-800">${inv.totalAmount || inv.total}</td>
                            <td className="p-4">
                              <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">{inv.status}</span>
                            </td>
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
            )}

            {/* Refunds Panel */}
            {activeTab === 'refunds' && (
              <div className="space-y-8">
                {renderHeaderBanner("Refund Management", "Audit refund requests and approve or reject release states")}

                <div className="space-y-6">
                  {refundRequests.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl p-10 bg-slate-50 text-xs font-semibold">
                      No refund requests currently pending audit.
                    </div>
                  ) : (
                    refundRequests.map(r => (
                      <div key={r._id} className="p-6 bg-white border border-slate-200 rounded-2xl text-xs space-y-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-800">Customer: {r.user?.name} ({r.user?.email})</strong>
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
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleProcessRefund(r._id, 'Approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors shadow-sm cursor-pointer"
                          >
                            Authorize & Release Refund
                          </button>
                          <button
                            onClick={() => handleProcessRefund(r._id, 'Rejected')}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors shadow-sm cursor-pointer"
                          >
                            Decline Refund
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Reports Panel */}
            {activeTab === 'reports' && (
              <div className="space-y-8">
                {renderHeaderBanner("Financial Reports", "Download aggregated balance sheet reports and monthly tax records")}

                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 text-sm">Download Exportable Formats</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="border border-slate-150 p-5 rounded-2xl flex flex-col justify-between items-start gap-4">
                      <div>
                        <strong className="text-slate-800 font-bold text-sm block">Excel Revenue spreadsheet</strong>
                        <p className="text-slate-400 text-xs mt-1">Contains all detailed succeeded transactions, TAX collected portions, and customer refs.</p>
                      </div>
                      <button
                        onClick={handleExportExcel}
                        className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all shadow-md shadow-gold-500/10 cursor-pointer border-none"
                      >
                        Download Excel Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Analytics Panel */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {renderHeaderBanner("Revenue Analytics", "Monthly revenue trend charts and gateway splits")}

                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 text-sm">Gross Sales Trend (By Month)</h3>

                  {/* Visual Chart Bars representing gross sales monthly */}
                  <div className="h-64 flex items-end gap-3 pt-6 border-b border-l border-slate-100 px-4">
                    {financeStats?.chartData?.map((val, idx) => {
                      const maxVal = Math.max(...(financeStats.chartData || [1000]));
                      const heightPercent = maxVal > 0 ? (val / maxVal) * 100 : 0;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -translate-y-8 pointer-events-none">${val}</span>
                          <div
                            style={{ height: `${Math.max(5, heightPercent)}%` }}
                            className="w-full bg-gold-500 hover:bg-gold-600 transition-all rounded-t-lg shadow-sm shadow-gold-500/10"
                          />
                          <span className="text-[9px] font-bold text-slate-450 uppercase">{new Date(0, idx).toLocaleString('en', { month: 'short' })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Panel */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {renderHeaderBanner("Financial Officer Profile", "Officer access configuration settings")}

                <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gold-500/10 text-gold-600 flex items-center justify-center text-2xl font-bold border border-gold-200 shadow-inner">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong className="text-lg text-slate-800 block font-bold">{user?.name}</strong>
                      <span className="text-xs text-slate-450 block font-semibold">{user?.email}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Access Privilege</span>
                      <strong className="text-slate-800 font-bold mt-0.5 block">{user?.role} / Financial Officer</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">System Status</span>
                      <strong className="text-emerald-600 font-bold mt-0.5 block">Active</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FinanceDashboard;
