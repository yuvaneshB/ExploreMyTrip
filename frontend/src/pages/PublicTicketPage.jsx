import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle2, AlertTriangle, XCircle, Clock, 
  Calendar, MapPin, User, Loader, Ticket, ShieldCheck
} from 'lucide-react';
import logo from '../assets/logo.png';

const PublicTicketPage = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError(null);
      try {
        const getApiUrl = () => {
          const envUrl = import.meta.env.VITE_API_URL;
          if (envUrl && envUrl !== 'undefined' && envUrl !== 'null' && envUrl.trim() !== '') {
            const cleanUrl = envUrl.replace(/\/$/, '');
            if (cleanUrl.endsWith('/api/v1')) return cleanUrl;
            if (cleanUrl.endsWith('/api')) return `${cleanUrl}/v1`;
            return `${cleanUrl}/api/v1`;
          }
          const { protocol, hostname } = window.location;
          if (hostname && (hostname === 'localhost' || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname))) {
            const cleanProtocol = protocol && protocol.includes(':') ? protocol : 'http:';
            return `${cleanProtocol}//${hostname}:4000/api/v1`;
          }
          return 'https://exploremytrip.onrender.com/api/v1';
        };
        const apiBaseURL = getApiUrl();

        const res = await axios.get(`${apiBaseURL}/bookings/verify/${bookingId}?token=${token}`);
        if (res.data.success && res.data.verified) {
          setTicket(res.data.ticket);
        } else {
          setError(res.data.message || 'Ticket verification failed.');
        }
      } catch (err) {
        console.error('Ticket verification error:', err);
        setError(err.response?.data?.message || 'A network error occurred while verifying the ticket.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId && token) {
      fetchTicket();
    } else {
      setError('Invalid or missing ticket identification tokens.');
      setLoading(false);
    }
  }, [bookingId, token]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 px-4 relative">
        <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl text-center space-y-6">
          <img src={logo} alt="ExploreMyTrip Logo" className="h-10 mx-auto object-contain" />
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <Loader className="w-12 h-12 text-gold-500 animate-spin" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">
              Verifying Ticket Credentials...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 px-4 relative">
        <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl text-center space-y-6">
          <img src={logo} alt="ExploreMyTrip Logo" className="h-10 mx-auto object-contain" />
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-rose-600">INVALID TICKET</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              {error || 'This ticket token is invalid, unrecognized, or has been tampered with.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Status mapping
  const getStatusConfig = (status) => {
    switch (status) {
      case 'VALID TICKET':
        return {
          icon: <CheckCircle2 className="w-10 h-10" />,
          colorClass: 'text-emerald-600',
          bgClass: 'bg-emerald-50 border-emerald-100',
          gradientClass: 'from-emerald-500 to-teal-600',
          label: 'VALID TICKET'
        };
      case 'CANCELLED TICKET':
        return {
          icon: <XCircle className="w-10 h-10" />,
          colorClass: 'text-rose-600',
          bgClass: 'bg-rose-50 border-rose-100',
          gradientClass: 'from-rose-500 to-pink-600',
          label: 'CANCELLED TICKET'
        };
      case 'EXPIRED TICKET':
        return {
          icon: <Clock className="w-10 h-10" />,
          colorClass: 'text-amber-600',
          bgClass: 'bg-amber-50 border-amber-100',
          gradientClass: 'from-amber-500 to-orange-600',
          label: 'EXPIRED TICKET'
        };
      default:
        return {
          icon: <AlertTriangle className="w-10 h-10" />,
          colorClass: 'text-rose-600',
          bgClass: 'bg-rose-50 border-rose-100',
          gradientClass: 'from-rose-500 to-red-600',
          label: 'INVALID TICKET'
        };
    }
  };

  const statusConfig = getStatusConfig(ticket.ticketStatus);

  return (
    <div className="min-h-screen w-full bg-slate-50 py-12 px-4 sm:px-6 font-sans flex flex-col justify-center items-center">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Top Header without Back/Home links */}
        <div className="flex items-center justify-between px-2 w-full">
          <img src={logo} alt="ExploreMyTrip Logo" className="h-8 object-contain" />
          <div className="flex items-center gap-1 text-gold-500 font-black text-[10px] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-gold-500" /> Secure Ticket Verification
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-left">
          {/* Top colored banner */}
          <div className={`bg-gradient-to-r ${statusConfig.gradientClass} p-8 text-white text-center space-y-2`}>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto shadow-inner">
              {statusConfig.icon}
            </div>
            <h1 className="text-2xl font-black tracking-wider uppercase">{statusConfig.label}</h1>
            <p className="text-[10px] text-white/80 font-bold tracking-widest uppercase">ExploreMyTrip Official Verification</p>
          </div>

          {/* Ticket Information Body */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Destination Tour</h3>
              <p className="text-lg font-black text-slate-800 mt-1">{ticket.destinationName}</p>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-xs">
              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Passenger Name</span>
                <strong className="text-slate-700 font-bold text-sm block mt-0.5">{ticket.customerName}</strong>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Booking Reference</span>
                <strong className="text-slate-700 font-bold text-sm block mt-0.5">{ticket.bookingReference}</strong>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Travel Date</span>
                <strong className="text-slate-750 font-semibold block mt-0.5">
                  {new Date(ticket.travelDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </strong>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Travel Time</span>
                <strong className="text-slate-750 font-semibold block mt-0.5">{ticket.travelTime}</strong>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Travelers Count</span>
                <strong className="text-slate-750 font-semibold block mt-0.5">{ticket.travelerCount} Person(s)</strong>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider font-semibold">Pricing Package</span>
                <strong className="text-slate-750 font-semibold block mt-0.5">{ticket.packageName} Plan</strong>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Payment Status</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 uppercase ${
                  ticket.paymentStatus === 'Paid' 
                    ? 'bg-emerald-55/10 text-emerald-600 border border-emerald-100' 
                    : ticket.paymentStatus === 'Deposited'
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {ticket.paymentStatus}
                </span>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Booking Status</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 uppercase ${
                  ticket.bookingStatus === 'Fully Paid' || ticket.bookingStatus === 'Deposited'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : ticket.bookingStatus === 'Cancelled' || ticket.bookingStatus === 'Refunded'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {ticket.bookingStatus}
                </span>
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="border-t border-slate-100 pt-6 flex items-start gap-2.5">
              <Ticket className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                This verification result is generated securely from ExploreMyTrip Live Database. Please check that the passenger details match a valid state-issued photo identification.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicTicketPage;
