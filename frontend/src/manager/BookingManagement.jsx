import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export const BookingManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
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
    fetchBookings();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading Bookings...</div>;

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans">Booking Management</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">Track client trip signups, departure dates, and seat occupancy</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="p-4">Customer</th>
                <th className="p-4">Seats</th>
                <th className="p-4">Pricing Plan</th>
                <th className="p-4">Departure Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {payments.map((p, idx) => {
                const booking = p.booking;
                if (!booking) return null;
                return (
                  <tr key={booking._id || idx} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-800">{p.user?.name || 'Customer'}</td>
                    <td className="p-4 font-semibold text-slate-600">{booking.numSeats} seats</td>
                    <td className="p-4 text-slate-600 font-semibold">{booking.pricingPlanName || 'Standard'}</td>
                    <td className="p-4 text-slate-550">{new Date(booking.departureDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded text-[10px]">
                        {booking.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
