import express from 'express';
import {
  createBookingHold,
  confirmPayment,
  getMyBookings,
  getBookingDetails,
  validateCoupon,
  cancelBooking,
  getBookingTicket,
  getBookingInvoice,
  getAgentBookings,
  resendBookingEmail,
  downloadTicket,
  downloadItinerary,
  downloadDocumentByToken
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.post('/hold', protect, createBookingHold);
router.post('/confirm', protect, confirmPayment);
router.post('/:id/resend', protect, resendBookingEmail);
router.get('/my', protect, getMyBookings);
router.get('/my-bookings', protect, getMyBookings);
router.get('/agent/my-bookings', protect, authorize('Agent'), getAgentBookings);
router.post('/coupon/validate', protect, validateCoupon);

router.get('/:id', protect, getBookingDetails);
router.get('/:id/ticket', protect, getBookingTicket);
router.get('/:id/invoice', protect, getBookingInvoice);
router.patch('/:id/cancel', protect, cancelBooking);

router.get('/:id/download-ticket', (req, res, next) => {
  if (req.query.token) {
    return next();
  }
  return protect(req, res, next);
}, downloadTicket);

router.get('/:id/download-itinerary', (req, res, next) => {
  if (req.query.token) {
    return next();
  }
  return protect(req, res, next);
}, downloadItinerary);

router.get('/documents/download/:secureToken', downloadDocumentByToken);

export default router;

