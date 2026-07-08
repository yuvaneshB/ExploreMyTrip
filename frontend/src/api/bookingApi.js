import api from '../services/api.js';

export const getMyBookings = async () => {
  try {
    const res = await api.get('/bookings/my');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch bookings:', error.message);
    throw error;
  }
};

export const getBookingDetails = async (id) => {
  try {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch booking ${id} details:`, error.message);
    throw error;
  }
};

export const getBookingTicket = async (id) => {
  try {
    const res = await api.get(`/bookings/${id}/ticket`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch booking ${id} ticket:`, error.message);
    throw error;
  }
};

export const getBookingInvoice = async (id) => {
  try {
    const res = await api.get(`/bookings/${id}/invoice`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch booking ${id} invoice:`, error.message);
    throw error;
  }
};

export const cancelBooking = async (id) => {
  try {
    const res = await api.patch(`/bookings/${id}/cancel`);
    return res.data;
  } catch (error) {
    console.error(`Failed to cancel booking ${id}:`, error.message);
    throw error;
  }
};

export const requestRefund = async (bookingId, reason) => {
  try {
    const res = await api.post('/reports/refunds/request', { bookingId, reason });
    return res.data;
  } catch (error) {
    console.error(`Failed to request refund for booking ${bookingId}:`, error.message);
    throw error;
  }
};

export const verifyTicket = async (token) => {
  try {
    const res = await api.get(`/bookings/ticket/verify/${token}`);
    return res.data;
  } catch (error) {
    console.error(`Failed to verify ticket with token ${token}:`, error.message);
    throw error;
  }
};

