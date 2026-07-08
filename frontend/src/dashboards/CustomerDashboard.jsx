import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getBackendUrl } from '../services/api.js';
import Sidebar from '../components/Sidebar.jsx';
import { 
  Shield, Award, User, FileText 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'profile', 'refunds'

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/profile')) {
      setActiveTab('profile');
    } else if (path.endsWith('/refunds')) {
      setActiveTab('refunds');
    } else {
      setActiveTab('bookings');
    }
  }, [location.pathname]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'bookings') {
      navigate('/dashboard/customer');
    } else {
      navigate(`/dashboard/customer/${tabName}`);
    }
  };
  const [bookings, setBookings] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile forms
  const [passportName, setPassportName] = useState(user?.passportDetails?.fullName || '');
  const [passportNumber, setPassportNumber] = useState(user?.passportDetails?.passportNumber || '');
  const [passportExpiry, setPassportExpiry] = useState(user?.passportDetails?.expiryDate ? new Date(user.passportDetails.expiryDate).toISOString().split('T')[0] : '');
  const [passportCountry, setPassportCountry] = useState(user?.passportDetails?.issuingCountry || '');
  
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '');
  const [emergencyRel, setEmergencyRel] = useState(user?.emergencyContact?.relationship || '');

  // Refund states
  const [selectedBooking, setSelectedBooking] = useState('');
  const [refundReason, setRefundReason] = useState('');




  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, refundsRes] = await Promise.all([
        api.get('/bookings/my-bookings'),
        api.get('/reports/refunds') // Wait, the client can query reports/refunds, let's see if customer gets their refunds. If needed we fallback.
      ]);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
      if (refundsRes.data.success) {
        // Filter refunds belonging to customer
        const clientRefunds = refundsRes.data.refunds.filter(r => r.user?._id === user?.id || r.user === user?.id);
        setRefunds(clientRefunds);
      }
    } catch (err) {
      console.warn('Failed to load logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        passportDetails: {
          fullName: passportName,
          passportNumber,
          expiryDate: passportExpiry,
          issuingCountry: passportCountry
        },
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRel
        }
      };

      const res = await updateProfile(payload);
      if (res.success) {
        toast.success(res.message);
      }
    } catch (err) {
      toast.error('Failed to update profile details');
    }
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) {
      toast.error('Select booking to cancel');
      return;
    }

    try {
      const res = await api.post('/reports/refunds/request', {
        bookingId: selectedBooking,
        reason: refundReason
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedBooking('');
        setRefundReason('');
        loadCustomerData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund request failed');
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 font-sans overflow-hidden">
      <Sidebar role="Customer" />

      {/* Content panel — owns its own scroll */}
      <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto h-full">
        {/* Banner */}
        <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-3xl flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="text-gold-gradient font-bold">{user?.name}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Manage passport records, download e-tickets, and track your refunds</p>
          </div>
          <Award className="w-12 h-12 text-gold-500 hidden sm:block" />
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 border-b border-slate-200 pb-3">
          <button 
            onClick={() => handleTabChange('bookings')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'bookings' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            My Trips ({bookings.length})
          </button>
          <button 
            onClick={() => handleTabChange('profile')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'profile' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Documents & Passport
          </button>
          <button 
            onClick={() => handleTabChange('refunds')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'refunds' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Refund Tracker
          </button>
        </div>

        {/* Dynamic tabs render */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {loading ? (
              <p className="text-slate-500 text-xs">Loading trips...</p>
            ) : bookings.length === 0 ? (
              <div className="glass-panel p-10 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs shadow-sm">
                No bookings found. <Link to="/tours" className="text-gold-500 hover:underline">Find a getaway!</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {bookings.map((b) => (
                  <div key={b._id} className="glass-panel p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          b.status === 'Fully Paid' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25' :
                          b.status === 'Deposited' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/25' :
                          'bg-amber-500/10 text-amber-600 border border-amber-500/25'
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-xs text-slate-500">Departure: {new Date(b.departureDate).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800">{b.tour?.title}</h3>
                      <p className="text-xs text-slate-550">Seats Reserved: {b.numSeats} passengers | Pricing: {b.pricingPlanName} Plan</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <a 
                        href={`${getBackendUrl()}/api/v1/bookings/${b._id}/download-ticket?token=${b.secureToken}`}
                        download
                        className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-4 h-4" /> Download E-Ticket
                      </a>
                      <a 
                        href={`${getBackendUrl()}/api/v1/bookings/${b._id}/download-itinerary?token=${b.secureToken}`}
                        download
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
                      >
                        <FileText className="w-4 h-4 text-slate-500" /> Download Itinerary
                      </a>
                      
                      {b.status !== 'Cancelled' && b.status !== 'Refunded' && (
                        <button 
                          onClick={() => {
                            setSelectedBooking(b._id);
                            handleTabChange('refunds');
                          }}
                          className="text-xs text-rose-600 border border-rose-200 hover:bg-rose-50 px-4 py-2.5 rounded-xl font-semibold transition-colors"
                        >
                          Request Cancellation
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Passport card */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-4">
                <Shield className="w-5 h-5 text-gold-500" /> Passport details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Passport Full Name</label>
                  <input
                    type="text"
                    value={passportName}
                    onChange={(e) => setPassportName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                    placeholder="As printed on passport"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Passport Number</label>
                  <input
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                    placeholder="E.g. Z9999999"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={passportExpiry}
                      onChange={(e) => setPassportExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Issuing Country</label>
                    <input
                      type="text"
                      value={passportCountry}
                      onChange={(e) => setPassportCountry(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                      placeholder="E.g. USA"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency card */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-4">
                  <User className="w-5 h-5 text-gold-500" /> Emergency Contact
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                      placeholder="Contact person full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Phone</label>
                      <input
                        type="text"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                        placeholder="Emergency number"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Relationship</label>
                      <input
                        type="text"
                        value={emergencyRel}
                        onChange={(e) => setEmergencyRel(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                        placeholder="Spouse, parent..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-gold-500/10"
              >
                Save travel profiles
              </button>
            </div>
          </form>
        )}

        {activeTab === 'refunds' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Request form */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 self-start space-y-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-3">
                Request Cancellation
              </h3>
              <form onSubmit={handleRefundSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Select Active Trip</label>
                  <select
                    value={selectedBooking}
                    onChange={(e) => setSelectedBooking(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs cursor-pointer text-slate-800"
                  >
                    <option value="">Select Booking</option>
                    {bookings
                      .filter(b => b.status === 'Fully Paid' || b.status === 'Deposited')
                      .map(b => (
                        <option key={b._id} value={b._id}>{b.tour?.title} (${b.amountPaid} paid)</option>
                      ))
                    }
                  </select>
                </div>

                {/* Cancellation Policy Estimate UI */}
                {selectedBooking && (() => {
                  const b = bookings.find(x => x._id === selectedBooking);
                  if (!b) return null;
                  const departureDate = new Date(b.departureDate);
                  const hoursToDeparture = (departureDate - Date.now()) / (1000 * 60 * 60);

                  let refundAmount = 0;
                  let retentionFee = 0;
                  let bracket = '';
                  let bgClass = '';
                  let textClass = '';

                  if (hoursToDeparture >= 72) {
                    refundAmount = b.amountPaid;
                    retentionFee = 0;
                    bracket = 'Free Cancellation: 100% Refund';
                    bgClass = 'bg-emerald-50 border border-emerald-200';
                    textClass = 'text-emerald-800';
                  } else if (hoursToDeparture >= 24) {
                    refundAmount = Math.round(b.amountPaid * 0.75 * 100) / 100;
                    retentionFee = Math.round(b.amountPaid * 0.25 * 100) / 100;
                    bracket = 'Late Cancellation: 75% Refund (25% Fee)';
                    bgClass = 'bg-amber-50 border border-amber-200';
                    textClass = 'text-amber-800';
                  } else {
                    refundAmount = 0;
                    retentionFee = b.amountPaid;
                    bracket = 'Last-Minute: Non-Refundable (0% Refund)';
                    bgClass = 'bg-rose-50 border border-rose-200';
                    textClass = 'text-rose-800';
                  }

                  return (
                    <div className={`p-4 rounded-2xl text-left space-y-2 text-xs font-semibold ${bgClass} ${textClass}`}>
                      <h4 className="font-extrabold uppercase text-[9px] tracking-wider opacity-85">Cancellation Policy Estimate</h4>
                      <p className="font-extrabold text-sm leading-snug">{bracket}</p>
                      <div className="pt-1.5 border-t border-current/10 flex justify-between font-medium">
                        <span>Amount Paid:</span>
                        <span>${b.amountPaid}</span>
                      </div>
                      <div className="flex justify-between font-black text-sm pt-0.5">
                        <span>Est. Refund:</span>
                        <span>${refundAmount}</span>
                      </div>
                      {retentionFee > 0 && (
                        <div className="flex justify-between text-[10px] opacity-75">
                          <span>Retention Fee:</span>
                          <span>-${retentionFee}</span>
                        </div>
                      )}
                      <p className="text-[9px] leading-relaxed opacity-75 pt-1 font-medium">
                        Departure Date: {departureDate.toLocaleDateString()} ({Math.max(0, Math.floor(hoursToDeparture))} hours left)
                      </p>
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Reason for Cancellation</label>
                  <textarea
                    rows="3"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Describe reason..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Submit Request
                </button>
              </form>
            </div>

            {/* Refunds list */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-3">
                Refund Applications
              </h3>
              {refunds.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No refund applications recorded.</p>
              ) : (
                <div className="space-y-4">
                  {refunds.map(r => (
                    <div key={r._id} className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-left font-sans">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">
                            {r.booking?.tour?.title || 'Tour Getaway'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                            Ref: {r.booking?._id ? r.booking._id.substring(0, 10).toUpperCase() : 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-650 font-medium">
                          Refund Sum: <span className="text-emerald-600 font-extrabold text-sm">${r.refundAmount}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Reason: <span className="italic">"{r.reason}"</span>
                        </p>
                        {r.managerComments && (
                          <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-650 font-semibold leading-relaxed">
                            <span className="font-black text-slate-500 block uppercase text-[8px] tracking-wider mb-0.5">Manager Comments:</span>
                            {r.managerComments}
                          </div>
                        )}
                      </div>
                      <span className={`self-start sm:self-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        r.status === 'Processed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' :
                        r.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 border-rose-500/25' :
                        'bg-amber-500/10 text-amber-600 border-amber-500/25'
                      }`}>
                        {r.status === 'Processed' ? 'Approved' : r.status === 'Rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default CustomerDashboard;
