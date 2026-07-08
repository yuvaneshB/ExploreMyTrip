import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBookingDetails, getBookingTicket, getBookingInvoice, cancelBooking, requestRefund } from '../api/bookingApi.js';
import { getBackendUrl } from '../services/api.js';
import {
  Calendar, MapPin, Clock, DollarSign, CheckCircle2,
  AlertCircle, XCircle, Loader, Ticket, Receipt,
  Navigation, Share2, Printer, ChevronLeft, Info,
  User, PhoneCall, FileText, Heart, Compass
} from 'lucide-react';
import toast from 'react-hot-toast';

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [invoice, setInvoice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, ticket, invoice

  // Fetch detailed data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const bRes = await getBookingDetails(id);
      if (bRes && bRes.success) {
        setBooking(bRes.booking);

        // Populate E-Ticket and Invoice concurrently in background if fully paid or deposited
        try {
          const [tRes, iRes] = await Promise.all([
            getBookingTicket(id).catch(() => null),
            getBookingInvoice(id).catch(() => null)
          ]);
          if (tRes && tRes.success) setTicket(tRes.ticket);
          if (iRes && iRes.success) setInvoice(iRes.invoice);
        } catch (e) {
          console.warn('Concurrently fetching ticket/invoice details warning:', e.message);
        }
      } else {
        setError('Booking not found');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve booking information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCancel = async () => {
    const isPaid = booking.amountPaid > 0 || ['Fully Paid', 'Deposited'].includes(booking.status);

    let reason = '';
    if (isPaid) {
      reason = window.prompt(
        'This is a paid booking. To request cancellation and initiate a refund according to policy, please enter a cancellation reason:'
      );
      if (reason === null) return; // User cancelled prompt
      if (!reason.trim()) {
        toast.error('A cancellation reason is required.');
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to cancel this booking? Held seats will be returned.')) return;
    }

    const toastId = toast.loading(isPaid ? 'Submitting refund request...' : 'Processing cancellation...');
    try {
      const res = isPaid ? await requestRefund(id, reason) : await cancelBooking(id);
      if (res.success) {
        toast.success(isPaid ? 'Cancellation & Refund request submitted successfully' : 'Booking cancelled successfully', { id: toastId });
        setBooking(prev => ({ ...prev, status: 'Cancelled' }));
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel booking', { id: toastId });
    }
  };

  // E-Ticket Share Copy Simulation
  const handleShare = () => {
    if (!ticket) return;
    const shareText = `ExploreMyTrip Booking details! Ticket Ref: ${ticket.bookingReferenceNumber} for ${ticket.destinationName}. Travel Date: ${new Date(ticket.travelDate).toLocaleDateString()}.`;
    navigator.clipboard.writeText(shareText);
    toast.success('Share details link copied to clipboard!');
  };

  // Printing trigger
  const handlePrint = (printTargetId) => {
    // We inject print-specific CSS styles temporarily or target using a print wrapper
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #${printTargetId}, #${printTargetId} * {
          visibility: visible;
        }
        #${printTargetId} {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          border: none !important;
          box-shadow: none !important;
          background: white !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    // Clean up style
    setTimeout(() => {
      document.head.removeChild(style);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader className="w-10 h-10 text-gold-500 animate-spin" />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Retrieving booking file...</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 border border-slate-200 rounded-3xl bg-white text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-slate-800">Booking Retrieval Failed</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">{error || 'Unable to open your booking.'}</p>
        </div>
        <button onClick={() => navigate('/bookings')} className="bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer">
          Back to Bookings
        </button>
      </div>
    );
  }

  const tour = booking.tour;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 font-sans space-y-6 text-slate-800 min-h-screen">

      {/* Top Header Row with back arrow */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-gold-500 cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to My Bookings
        </button>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Reference Code</span>
          <strong className="text-sm text-slate-800 font-extrabold">Ref: {booking._id.substring(0, 10).toUpperCase()}</strong>
        </div>
      </div>

      {/* Hero Banner details */}
      <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-md shrink-0 bg-slate-900">
        <img
          src={tour?.images?.[0] || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
          alt={tour?.title}
          className="w-full h-full object-cover opacity-70"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
          <div className="space-y-1.5 text-left">
            <span className="bg-gold-500/90 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {tour?.category?.name || 'Guided Travel'}
            </span>
            <h1 className="text-2xl md:text-3xl font-black">{tour?.title}</h1>
            <p className="text-xs text-slate-350 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" /> {tour?.location || 'Location not specified'}
            </p>
          </div>

          <div className="flex gap-2">
            {booking.status !== 'Cancelled' && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Cancel Booking
              </button>
            )}
            <a
              href="mailto:support@exploremytrip.com?subject=Booking Support Request"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Tabs navigation panel */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'overview'
            ? 'border-gold-500 text-gold-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Compass className="w-4 h-4 inline-block mr-1.5" /> Overview & Guide
        </button>

        {ticket && (
          <button
            onClick={() => setActiveTab('ticket')}
            className={`px-6 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'ticket'
              ? 'border-gold-500 text-gold-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <Ticket className="w-4 h-4 inline-block mr-1.5" /> Boarding Pass (E-Ticket)
          </button>
        )}

        {invoice && (
          <button
            onClick={() => setActiveTab('invoice')}
            className={`px-6 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'invoice'
              ? 'border-gold-500 text-gold-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <Receipt className="w-4 h-4 inline-block mr-1.5" /> Billing Invoice
          </button>
        )}
      </div>

      {/* Tab content areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Main Tab Details columns */}
        <div className="lg:col-span-2 space-y-6">

          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Itinerary Summary cards */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                <h3 className="text-lg font-black text-slate-850 border-b border-slate-100 pb-2">Tour Overview</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{tour?.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl text-gold-500 shrink-0">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-450 font-bold block uppercase tracking-wider">Departure Date</span>
                      <strong className="text-xs font-semibold text-slate-700">{new Date(booking.departureDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl text-gold-500 shrink-0">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-450 font-bold block uppercase tracking-wider">Duration Days</span>
                      <strong className="text-xs font-semibold text-slate-700">{tour?.durationDays || '7'} Days</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traveler sheets info list */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                <h3 className="text-lg font-black text-slate-850 border-b border-slate-100 pb-2">Traveler List</h3>
                <div className="divide-y divide-slate-150">
                  {booking.travelers && booking.travelers.length > 0 ? (
                    booking.travelers.map((t, index) => (
                      <div key={index} className="py-3 flex flex-wrap justify-between items-center gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                            {index + 1}
                          </div>
                          <div>
                            <strong className="font-bold text-slate-800 text-sm block">{t.name}</strong>
                            <span className="text-slate-500 font-medium">{t.age} years old | {t.gender}</span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right font-medium text-slate-500">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Passport Number</span>
                          <span>{t.passportNumber} (Expires: {new Date(t.passportExpiry).toLocaleDateString()})</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-450 py-3 font-semibold">Only primary booker details are registered.</div>
                  )}
                </div>
              </div>


            </div>
          )}

          {activeTab === 'ticket' && ticket && (
            <div className="space-y-4">

              {/* E-Ticket Display card */}
              <div
                id="print-ticket-area"
                className="bg-white border-2 border-dashed border-slate-300 rounded-3xl shadow-lg p-6 max-w-xl mx-auto space-y-6 font-sans relative overflow-hidden text-left"
              >
                {/* Branding header in ticket */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-1.5 text-gold-500">
                    <Compass className="w-6 h-6 animate-spin-slow" />
                    <span className="text-sm font-extrabold tracking-wider uppercase">ExploreMyTrip Ticket</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-emerald-100">
                    ACTIVE BOARDING PASS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Passenger Name</span>
                    <strong className="text-sm text-slate-800 font-bold">{ticket.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Ticket Ref Code</span>
                    <strong className="text-sm text-slate-800 font-bold">{ticket.bookingReferenceNumber}</strong>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Destination Tour</span>
                    <strong className="text-slate-800 font-bold">{ticket.destinationName}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">City/Country</span>
                    <strong className="text-slate-800 font-bold">{ticket.city}, {ticket.country}</strong>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Travel Date</span>
                    <strong className="text-slate-800 font-bold">{new Date(ticket.travelDate).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Travel Time</span>
                    <strong className="text-slate-800 font-bold">{ticket.travelTime}</strong>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Travelers count</span>
                    <strong className="text-slate-800 font-bold">{ticket.travelerCount} Person(s)</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Seats Assigned</span>
                    <strong className="text-slate-800 font-bold truncate block">{ticket.seatInformation}</strong>
                  </div>
                </div>

                {/* Download links */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center py-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <a
                    href={`${getBackendUrl()}/api/v1/bookings/${booking._id}/download-ticket?token=${booking.secureToken}`}
                    download
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <FileText className="w-4 h-4" /> Download E-Ticket
                  </a>
                  <a
                    href={`${getBackendUrl()}/api/v1/bookings/${booking._id}/download-itinerary?token=${booking.secureToken}`}
                    download
                    className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <FileText className="w-4 h-4" /> Download Itinerary
                  </a>
                </div>

                {/* Print instructions info box */}
                <div className="text-[10px] text-slate-400 leading-relaxed font-semibold border-t border-slate-100 pt-4 flex gap-2 items-start">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p>Please present this digital boarding pass or a printed hardcopy at the meeting point 15 minutes before the scheduled travel time. Valid photo ID matching passenger details is required.</p>
                </div>
              </div>

              {/* Action row */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handlePrint('print-ticket-area')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print E-Ticket
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Pass
                </button>
              </div>
            </div>
          )}

          {activeTab === 'invoice' && invoice && (
            <div className="space-y-4">

              {/* Billing Invoice card */}
              <div
                id="print-invoice-area"
                className="bg-white border border-slate-220 shadow-lg p-8 rounded-3xl max-w-xl mx-auto space-y-6 font-sans text-left"
              >
                {/* Invoice Branding Header */}
                <div className="flex justify-between items-start border-b border-slate-150 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">ExploreMyTrip Ltd.</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Premium Travel Invoicing</span>
                  </div>

                  <div className="text-right">
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit ml-auto mb-1">
                      {invoice.status}
                    </span>
                    <strong className="text-sm font-extrabold text-slate-800">{invoice.invoiceNumber}</strong>
                  </div>
                </div>

                {/* Bill details */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Billing Date</span>
                    <strong className="text-slate-800 font-bold">{new Date(invoice.createdAt).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Due Amount</span>
                    <strong className="text-slate-800 font-bold">$0.00 (Cleared)</strong>
                  </div>
                </div>

                {/* Cost tables */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1.5">
                    <span>Item Description</span>
                    <span>Total Amount</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">{tour?.title}</span>
                      <span className="text-slate-400 font-medium">Qty {booking.numSeats} traveler(s) &bull; {booking.pricingPlanName} Plan</span>
                    </div>
                    <strong className="text-slate-800 font-bold">${booking.subTotal}</strong>
                  </div>
                </div>

                {/* Summary breakdowns */}
                <div className="border-t border-slate-150 pt-4 flex flex-col gap-1.5 text-xs font-semibold max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <strong className="text-slate-700">${invoice.subTotal}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Discount Applied:</span>
                    <strong className="text-slate-700">-${invoice.discountAmount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax (15%):</span>
                    <strong className="text-slate-700">${invoice.taxAmount}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black">
                    <span className="text-slate-850">Total Amount Paid:</span>
                    <strong className="text-slate-900">${invoice.totalAmount}</strong>
                  </div>
                </div>
              </div>

              {/* Invoice Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handlePrint('print-invoice-area')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>

                {invoice.pdfPath && (
                  <a
                    href={`https://exploremytrip.onrender.com${invoice.pdfPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Download Official PDF
                  </a>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Info Panels */}
        <div className="space-y-6">

          {/* Timeline Lifecycle Panel */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4 text-left">
            <h3 className="text-base font-black text-slate-850 border-b border-slate-100 pb-1.5">Booking Timeline</h3>
            <div className="space-y-4 font-sans text-xs">
              {booking.timeline && booking.timeline.length > 0 ? (
                booking.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-3 items-start relative pb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-gold-500 shrink-0 mt-1" />
                    <div>
                      <strong className="font-bold text-slate-850 block">{event.status}</strong>
                      <span className="text-slate-450 block text-[9px] font-bold">{new Date(event.timestamp).toLocaleString()}</span>
                      <p className="text-slate-500 font-medium leading-tight mt-0.5">{event.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 font-medium block">No timeline events recorded.</span>
              )}
            </div>
          </div>

          {/* Guidelines / Emergency Support Contacts */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4 text-left font-sans text-xs font-semibold text-slate-500">
            <h3 className="text-base font-black text-slate-850 border-b border-slate-100 pb-1.5">Emergency & Travel Contacts</h3>

            <div className="space-y-3">
              <div className="flex gap-2.5 items-start">
                <User className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Assigned Tour Guide</span>
                  <strong className="text-slate-800 text-xs">Alex Johnson (Helpline #24)</strong>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <PhoneCall className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Helpline Contact</span>
                  <a href="tel:+15559991234" className="text-gold-600 text-xs block font-bold">+1 (555) 999-1234</a>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <MapPin className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Meeting Point Location</span>
                  <strong className="text-slate-800 text-xs block">{tour?.city || 'City Center Main Lobby'}</strong>
                  <span className="text-[10px] text-slate-400 leading-normal block">Coords: {tour?.latitude || 0}, {tour?.longitude || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation and Terms Guidelines */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl text-left space-y-3 font-sans text-xs text-slate-500 font-semibold leading-relaxed">
            <h3 className="text-sm font-black text-slate-850 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Info className="w-4.5 h-4.5 text-slate-500" /> Cancellation Guidelines
            </h3>
            <p><strong>Standard Free cancellation</strong> is supported up to 72 hours before the scheduled departure date, with a full refund to your original payment method.</p>
            <p><strong>Cancellations within 72 hours</strong> are subject to a 25% surcharge fee. Cancellations within 24 hours are non-refundable.</p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BookingDetailsPage;
