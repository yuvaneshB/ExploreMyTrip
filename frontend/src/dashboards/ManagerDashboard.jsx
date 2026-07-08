import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import Sidebar from '../components/Sidebar.jsx';
import { 
  BarChart3, ShieldAlert, Check, X, AlertOctagon 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('kpis'); // 'kpis', 'reviews', 'refunds', 'staff'

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/reviews')) {
      setActiveTab('reviews');
    } else if (path.endsWith('/refunds')) {
      setActiveTab('refunds');
    } else if (path.endsWith('/staff')) {
      setActiveTab('staff');
    } else {
      setActiveTab('kpis');
    }
  }, [location.pathname]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'kpis') {
      navigate('/dashboard/manager');
    } else if (tabName === 'reviews') {
      navigate('/dashboard/manager/reviews');
    } else if (tabName === 'refunds') {
      navigate('/dashboard/manager/refunds');
    } else if (tabName === 'staff') {
      navigate('/dashboard/manager/staff');
    }
  };
  const [analytics, setAnalytics] = useState(null);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  
  // Refund comment states
  const [managerComments, setManagerComments] = useState({});
  const [loading, setLoading] = useState(true);

  const loadManagerData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, reviewsRes, refundsRes, staffRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/reviews/moderation'),
        api.get('/reports/refunds'),
        api.get('/reports/staff')
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics);
      if (reviewsRes.data.success) {
        // filter pending reviews
        setPendingReviews(reviewsRes.data.reviews.filter(r => r.moderationStatus === 'Pending' || r.isSpam));
      }
      if (refundsRes.data.success) {
        // filter pending refunds
        setRefundRequests(refundsRes.data.refunds.filter(r => r.status === 'Pending'));
      }
      if (staffRes.data.success) {
        setStaff(staffRes.data.staff);
      }
    } catch (err) {
      console.warn('Failed to load manager reports:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerData();
  }, [activeTab]);

  // Review Moderation
  const handleModerateReview = async (reviewId, status) => {
    try {
      const res = await api.put(`/reviews/${reviewId}/moderate`, { status });
      if (res.data.success) {
        toast.success(`Review ${status.toLowerCase()} successfully!`);
        loadManagerData();
      }
    } catch (err) {
      toast.error('Failed to moderate review');
    }
  };

  // Refund processing
  const handleProcessRefund = async (refundId, status) => {
    const comments = managerComments[refundId] || '';
    try {
      const res = await api.put(`/reports/refunds/${refundId}/process`, { status, comments });
      if (res.data.success) {
        toast.success(`Refund status updated to: ${status}`);
        setManagerComments({ ...managerComments, [refundId]: '' });
        loadManagerData();
      }
    } catch (err) {
      toast.error('Failed to process refund request');
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 font-sans overflow-hidden">
      <Sidebar role="Manager" />

      {/* Main Panel — owns its own scroll */}
      <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto h-full">
        {/* Banner */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800">Manager Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Audit security alerts, moderate spam feedbacks, and authorize refund deposits</p>
          </div>
          <ShieldAlert className="w-10 h-10 text-gold-500 animate-pulse" />
        </div>

        {/* Workspace tabs */}
        <div className="flex gap-4 border-b border-slate-200 pb-3">
          <button 
            onClick={() => handleTabChange('kpis')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'kpis' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Analytics & KPIs
          </button>
          <button 
            onClick={() => handleTabChange('reviews')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'reviews' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Reviews Moderation ({pendingReviews.length})
          </button>
          <button 
            onClick={() => handleTabChange('refunds')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'refunds' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Refund Approvals ({refundRequests.length})
          </button>
          <button 
            onClick={() => handleTabChange('staff')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'staff' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Staff Control ({staff.length})
          </button>
        </div>

        {/* Analytics & KPIs Tab */}
        {activeTab === 'kpis' && (
          <div className="space-y-8">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Tours Offered</span>
                <strong className="text-3xl block text-slate-800 mt-1">{analytics?.totalTours || 0}</strong>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Customers</span>
                <strong className="text-3xl block text-slate-800 mt-1">{analytics?.totalCustomers || 0}</strong>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Active Agents</span>
                <strong className="text-3xl block text-slate-800 mt-1">{analytics?.totalAgents || 0}</strong>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Booking Logs</span>
                <strong className="text-3xl block text-slate-800 mt-1">{analytics?.totalBookings || 0}</strong>
              </div>
            </div>

            {/* Top Destinations */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gold-550" /> Best Performing Tours & Destinations
              </h3>
              {analytics?.topDestinations?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No bookings recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {analytics?.topDestinations?.map((dest, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-200/80 p-4 rounded-xl text-xs shadow-inner">
                      <span className="font-bold text-slate-800">{dest.title}</span>
                      <span className="text-gold-650 font-bold">{dest.seatsBooked} seats booked</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Review Moderation Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {pendingReviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No pending reviews requiring moderation.</p>
            ) : (
              <div className="space-y-6">
                {pendingReviews.map(r => (
                  <div key={r._id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="text-slate-800">{r.user?.name}</strong> on <strong className="text-gold-600 font-bold">{r.tour?.title}</strong>
                      </div>
                      {r.isSpam && (
                        <span className="flex items-center gap-1 bg-rose-500/10 text-rose-600 border border-rose-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          <AlertOctagon className="w-3 h-3" /> Flagged Spam Filter
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 italic">"{r.comment}"</p>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleModerateReview(r._id, 'Approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Review
                      </button>
                      <button 
                        onClick={() => handleModerateReview(r._id, 'Spam')}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" /> Mark Spam
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Refund Approvals Tab */}
        {activeTab === 'refunds' && (
          <div className="space-y-6">
            {refundRequests.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No refund applications awaiting review.</p>
            ) : (
              <div className="space-y-6">
                {refundRequests.map(r => (
                  <div key={r._id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-slate-800">Customer: {r.user?.name} ({r.user?.email})</strong>
                        <span className="text-[10px] text-slate-500 block mt-1">Refund Sum: ${r.refundAmount} | Reason: "{r.reason}"</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase font-bold text-slate-500">Review Comments</label>
                      <input
                        type="text"
                        placeholder="Add review logs..."
                        value={managerComments[r._id] || ''}
                        onChange={(e) => setManagerComments({ ...managerComments, [r._id]: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleProcessRefund(r._id, 'Approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors shadow-sm"
                      >
                        Authorize Refund
                      </button>
                      <button 
                        onClick={() => handleProcessRefund(r._id, 'Rejected')}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors shadow-sm"
                      >
                        Decline Refund
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Staff Control Tab */}
        {activeTab === 'staff' && (
          <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="p-4">Staff Member</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500 italic">
                        No staff members recorded yet.
                      </td>
                    </tr>
                  ) : (
                    staff.map(s => (
                      <tr key={s._id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-800">{s.name}</td>
                        <td className="p-4 text-slate-600">{s.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            s.role === 'Manager' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            s.role === 'Finance' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {s.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
