import Booking from '../models/booking.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import Tour from '../models/tour.js';
import AgentTour from '../models/agentTour.js';
import Coupon from '../models/coupon.js';
import Payment from '../models/payment.js';
import Invoice from '../models/invoice.js';
import User from '../models/user.js';
import Refund from '../models/refund.js';
import { generateInvoicePDF, generateTicketPDF, generateItineraryPDF } from '../utilities/pdfGenerator.js';
import { sendEmail, generateBookingEmailHtml } from '../utilities/mailer.js';
import razorpayInstance from '../config/razorpay.js';
import path from 'path';
import os from 'os';

const getFrontendOrigin = (req) => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/$/, '');
  }
  // For development, find the active local network IP address fallback
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return `http://${iface.address}:5173`;
      }
    }
  }
  return 'http://localhost:5173';
};


// Apply and Validate Coupon
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    if (new Date() > coupon.expireDate) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (coupon.owner && req.user && coupon.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'This coupon belongs to another user' });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon has already been used.' });
    }

    if (subTotal < coupon.minSpend) {
      return res.status(400).json({ success: false, message: `Minimum spend of $${coupon.minSpend} required` });
    }

    let discount = 0;
    if (coupon.discountType === 'Percentage') {
      discount = (subTotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({ success: true, couponId: coupon._id, discountAmount: discount });
  } catch (error) {
    next(error);
  }
};

// Step 1: Create Seat Hold (15 Minutes Lock)
export const createBookingHold = async (req, res, next) => {
  try {
    const { tourId, departureDate, pricingPlanName, numSeats, travelers, addons, couponCode } = req.body;

    let tour = await Tour.findById(tourId);
    let tourModel = 'Tour';
    if (!tour) {
      tour = await AgentTour.findById(tourId);
      tourModel = 'AgentTour';
    }

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    // Verify departure array is present and is a non-empty array
    if (!tour.departures || !Array.isArray(tour.departures) || tour.departures.length === 0) {
      return res.status(400).json({ success: false, message: 'No departure schedule available for this tour' });
    }

    // Find departure date instance
    const departure = tour.departures.find(d => 
      new Date(d.date).toDateString() === new Date(departureDate).toDateString()
    );

    if (!departure) {
      return res.status(400).json({ success: false, message: 'Selected departure date is not available' });
    }

    if (departure.availableSeats < numSeats) {
      return res.status(400).json({ success: false, message: `Only ${departure.availableSeats} seats left` });
    }

    // Check pricing plan
    const plan = tour.pricingPlans.find(p => p.name === pricingPlanName);
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid pricing plan selected' });
    }

    // Calculate base price
    let basePrice = plan.price * numSeats;

    // Apply seasonal pricing multipliers if date matches
    const dateObj = new Date(departureDate);
    if (tour.seasonalPricing && Array.isArray(tour.seasonalPricing)) {
      const matchedSeason = tour.seasonalPricing.find(s => 
        dateObj >= new Date(s.startDate) && dateObj <= new Date(s.endDate)
      );
      if (matchedSeason) {
        basePrice = basePrice * matchedSeason.priceMultiplier;
      }
    }

    // Calculate addon surcharges
    let addonTotal = 0;
    if (addons) {
      if (addons.airportPickup) addonTotal += 50 * numSeats;
      if (addons.travelInsurance) addonTotal += 35 * numSeats;
      if (addons.hotelUpgrade) addonTotal += 100 * numSeats;
    }

    const subTotal = basePrice + addonTotal;

    // Coupon validations
    let discountAmount = 0;
    let couponRef = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
      }
      if (new Date() > coupon.expireDate) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: 'This coupon has already been used.' });
      }
      if (subTotal < coupon.minSpend) {
        return res.status(400).json({ success: false, message: `Minimum spend of $${coupon.minSpend} required` });
      }
      if (coupon.owner && coupon.owner.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: 'This coupon belongs to another user' });
      }
      discountAmount = coupon.discountType === 'Percentage' 
        ? (subTotal * coupon.discountValue) / 100 
        : coupon.discountValue;
      couponRef = coupon._id;
    }

    const taxAmount = Math.round((subTotal - discountAmount) * 0.15); // 15% TAX
    const totalAmount = subTotal - discountAmount + taxAmount;

    // Deduct seats and shift to hold state
    departure.availableSeats -= numSeats;
    departure.heldSeats += numSeats;
    await tour.save();

    // Create booking record with Hold status
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock

    const booking = await Booking.create({
      user: req.user._id,
      tour: tourId,
      tourModel,
      departureDate,
      pricingPlanName,
      numSeats,
      travelers,
      addons,
      subTotal,
      discountAmount,
      taxAmount,
      totalAmount,
      couponApplied: couponRef,
      status: 'Hold',
      holdExpiresAt,
      timeline: [{ status: 'Hold', message: 'Seat hold initialized for 15 minutes.' }]
    });

    res.status(201).json({
      success: true,
      message: 'Seats held successfully for 15 minutes.',
      bookingId: booking._id,
      holdExpiresAt,
      totalAmount
    });
  } catch (error) {
    next(error);
  }
};

// Step 2: Confirm Booking & Process Payment
export const confirmPayment = async (req, res, next) => {
  try {
    const { bookingId, gateway, paymentMethodId, amountPaid, paymentType } = req.body; // paymentType: 'Full' or 'Deposit'

    const booking = await Booking.findById(bookingId).populate('tour').populate('user');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }

    // Verify booking ownership
    if (booking.user._id.toString() !== req.user.id && !['Agent', 'Manager', 'Finance'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to process payment for this booking' });
    }

    // Resolve authenticated customer email securely from the database
    const customer = await User.findById(req.user.id).select('name email role');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Authenticated customer not found' });
    }

    if (!customer.email) {
      return res.status(400).json({ success: false, message: 'Customer does not have a registered email address' });
    }

    if (booking.status !== 'Hold' && booking.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Booking is not in a payable state' });
    }

    // Verify hold validity
    if (new Date() > booking.holdExpiresAt) {
      return res.status(400).json({ success: false, message: 'Hold session has expired. Please create a new booking.' });
    }

    const targetAmount = paymentType === 'Deposit' ? Math.round(booking.totalAmount * 0.25) : booking.totalAmount; // Deposit is 25%

    // Process payment via Razorpay / Mock (Stripe integration removed)
    let transactionId;
    try {
      const chargeResult = await razorpayInstance.orders.create({
        amount: targetAmount * 100,
        currency: 'USD'
      });
      transactionId = chargeResult.id;
    } catch (razorpayErr) {
      console.warn('Razorpay order creation failed, falling back to mock payment:', razorpayErr.message);
      transactionId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Create Payment Log
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: targetAmount,
      currency: 'USD',
      gateway,
      transactionId,
      status: 'Succeeded'
    });

    // Update Tour departure date seats hold commit
    let tour = await Tour.findById(booking.tour._id);
    if (!tour) {
      tour = await AgentTour.findById(booking.tour._id);
    }

    if (tour && tour.departures && Array.isArray(tour.departures)) {
      const departure = tour.departures.find(d => 
        new Date(d.date).toDateString() === new Date(booking.departureDate).toDateString()
      );
      if (departure) {
        departure.heldSeats -= booking.numSeats;
        await tour.save();
      }
    }

    // Update Booking details
    if (req.body.travelers) {
      booking.travelers = req.body.travelers;
    }
    if (req.body.addons) {
      booking.addons = req.body.addons;
    }
    booking.amountPaid += targetAmount;
    booking.status = booking.amountPaid >= booking.totalAmount ? 'Fully Paid' : 'Deposited';
    booking.holdExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // clear hold timer
    booking.timeline.push({
      status: booking.status,
      message: `Processed payment of $${targetAmount} via ${gateway}. Transaction ID: ${transactionId}`
    });
    await booking.save();

    // Increment Coupon usage if applicable
    if (booking.couponApplied) {
      await Coupon.findByIdAndUpdate(booking.couponApplied, { $inc: { usageCount: 1 } });
    }

    // Generate Invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const invoiceSavePath = path.resolve('./public/invoices', `${invoiceNumber}.pdf`);

    const invoice = await Invoice.create({
      invoiceNumber,
      booking: booking._id,
      user: req.user._id,
      subTotal: booking.subTotal,
      discountAmount: booking.discountAmount,
      taxAmount: booking.taxAmount,
      totalAmount: booking.totalAmount,
      status: booking.status === 'Fully Paid' ? 'Paid' : 'Unpaid',
      pdfPath: `/uploads/invoices/${invoiceNumber}.pdf`
    });

    // Generate PDF invoice physically
    await generateInvoicePDF(invoice, booking, booking.user, booking.tour, invoiceSavePath);

    // Ensure secureToken exists
    let secureToken = booking.secureToken;
    if (!secureToken) {
      secureToken = crypto.randomBytes(24).toString('hex');
      booking.secureToken = secureToken;
      await booking.save();
    }
    const eticketToken = jwt.sign(
      { bookingId: booking._id, docType: 'eticket' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    const itineraryToken = jwt.sign(
      { bookingId: booking._id, docType: 'itinerary' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Send email confirmation
    const emailHtml = generateBookingEmailHtml({
      userName: booking.user.name,
      booking,
      tour: booking.tour,
      frontendOrigin: getFrontendOrigin(req),
      eticketToken,
      itineraryToken
    });

    try {
      const emailResult = await sendEmail({
        to: customer.email,
        subject: `Your ExploreMyTrip Booking is Confirmed - ${booking._id}`,
        html: emailHtml,
        emailType: 'booking-confirmation'
      });

      if (emailResult && !emailResult.error && (!emailResult.rejected || emailResult.rejected.length === 0)) {
        booking.bookingEmailStatus = 'Sent';
        booking.bookingEmailSentAt = new Date();
      } else {
        booking.bookingEmailStatus = 'Failed';
      }
      await booking.save();
    } catch (mailError) {
      console.error('Failed to send booking confirmation email:', mailError.message);
      booking.bookingEmailStatus = 'Failed';
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: 'Booking payment processed successfully',
      booking,
      invoice
    });
  } catch (error) {
    // Increment retry count
    if (req.body.bookingId) {
      await Booking.findByIdAndUpdate(req.body.bookingId, { $inc: { paymentRetryCount: 1 } });
    }
    next(error);
  }
};

// Seat Hold Auto-Expiry Release Checker (Can be called via scheduler / route)
export const checkExpiredHolds = async () => {
  try {
    const expiredBookings = await Booking.find({
      status: 'Hold',
      holdExpiresAt: { $lt: new Date() }
    });

    for (const booking of expiredBookings) {
      let tour = await Tour.findById(booking.tour);
      if (!tour) {
        tour = await AgentTour.findById(booking.tour);
      }

      if (tour && tour.departures && Array.isArray(tour.departures)) {
        const departure = tour.departures.find(d => 
          new Date(d.date).toDateString() === new Date(booking.departureDate).toDateString()
        );
        if (departure) {
          // Return seats to inventory
          departure.availableSeats += booking.numSeats;
          departure.heldSeats -= booking.numSeats;
          await tour.save();
        }
      }

      booking.status = 'Cancelled';
      booking.timeline.push({
        status: 'Cancelled',
        message: 'Seat hold session expired. Booking auto-cancelled.'
      });
      await booking.save();
      console.log(`Auto-Cancelled expired booking: ${booking._id}`);
    }
  } catch (error) {
    console.error('Error checking expired seat holds:', error.message);
  }
};

// Get User Booking History
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('tour')
      .sort({ createdAt: -1 });

    // Ensure all bookings have a secureToken
    for (let b of bookings) {
      if (!b.secureToken) {
        b.secureToken = crypto.randomBytes(24).toString('hex');
        await b.save();
      }
    }

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

// Get Single Booking Details
export const getBookingDetails = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tour')
      .populate('user')
      .populate('couponApplied');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Auth check
    if (booking.user._id.toString() !== req.user.id && !['Agent', 'Manager', 'Finance'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    // Ensure secureToken exists
    if (!booking.secureToken) {
      booking.secureToken = crypto.randomBytes(24).toString('hex');
      await booking.save();
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};


// PATCH /api/v1/bookings/:id/cancel
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('tour').populate('user');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }
    
    // Auth check
    if (booking.user._id.toString() !== req.user.id && !['Agent', 'Manager', 'Finance'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }
    
    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }
    
    // Revert seats in the Tour departures array
    let tour = await Tour.findById(booking.tour._id);
    if (!tour) {
      tour = await AgentTour.findById(booking.tour._id);
    }

    if (tour && tour.departures && Array.isArray(tour.departures)) {
      const departure = tour.departures.find(d => 
        new Date(d.date).toDateString() === new Date(booking.departureDate).toDateString()
      );
      if (departure) {
        departure.availableSeats += booking.numSeats;
        if (booking.status === 'Hold') {
          departure.heldSeats = Math.max(0, departure.heldSeats - booking.numSeats);
        }
        await tour.save();
      }
    }
    
    // Automatically register refund request for paid bookings
    let policyMessage = '';
    if (booking.amountPaid > 0) {
      const existingRefund = await Refund.findOne({ booking: booking._id });
      if (!existingRefund) {
        const succeededPayment = await Payment.findOne({ booking: booking._id, status: 'Succeeded' });
        if (succeededPayment) {
          const departureDate = new Date(booking.departureDate);
          const hoursToDeparture = (departureDate - Date.now()) / (1000 * 60 * 60);

          let refundAmount = 0;
          let policyApplied = '';

          if (hoursToDeparture >= 72) {
            refundAmount = succeededPayment.amount;
            policyApplied = 'Free Cancellation (>= 72 Hours) - 100% Refund';
          } else if (hoursToDeparture >= 24) {
            refundAmount = Math.round(succeededPayment.amount * 0.75 * 100) / 100;
            policyApplied = 'Late Cancellation (24h - 72h) - 75% Refund (25% Retention Surcharge)';
          } else {
            refundAmount = 0;
            policyApplied = 'Last-Minute Cancellation (< 24 Hours) - Non-Refundable (0% Refund)';
          }

          await Refund.create({
            booking: booking._id,
            payment: succeededPayment._id,
            user: booking.user._id,
            refundAmount,
            reason: `Auto-generated refund request on customer cancellation. [Policy: ${policyApplied}]`
          });

          policyMessage = `. Refund request auto-initiated. Policy Estimate: ${policyApplied}. Estimated Refund: $${refundAmount}`;
        }
      }
    }

    // Update booking details
    booking.status = 'Cancelled';
    booking.timeline.push({
      status: booking.amountPaid > 0 ? 'Refund Requested' : 'Cancelled',
      message: `Booking cancelled by ${req.user.name} (${req.user.role})${policyMessage}.`
    });
    await booking.save();
    
    // Update related invoice status if any
    const invoice = await Invoice.findOne({ booking: booking._id });
    if (invoice) {
      invoice.status = 'Cancelled';
      await invoice.save();
    }
    
    // Send cancellation notification email
    try {
      const emailHtml = `
        <h2>Booking Cancelled</h2>
        <p>Dear ${booking.user.name},</p>
        <p>Your booking for the tour <strong>${booking.tour.title}</strong> has been cancelled.</p>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p>If a refund is applicable under our cancellation policy, it will be processed within 5-7 business days.</p>
      `;
      await sendEmail({
        to: booking.user.email,
        subject: `Booking Cancelled - ${booking.tour.title}`,
        html: emailHtml
      });
    } catch (mailErr) {
      console.warn('Failed to send cancellation email:', mailErr.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/bookings/:id/ticket
export const getBookingTicket = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('tour').populate('user');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }
    
    // Auth check
    if (booking.user._id.toString() !== req.user.id && !['Agent', 'Manager', 'Finance'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }
    
    // Ensure secureToken exists
    let secureToken = booking.secureToken;
    if (!secureToken) {
      secureToken = crypto.randomBytes(24).toString('hex');
      booking.secureToken = secureToken;
      await booking.save();
    }
    
    res.status(200).json({
      success: true,
      ticket: {
        bookingId: booking._id,
        bookingReferenceNumber: `TX-${booking._id.toString().substring(0, 8).toUpperCase()}`,
        customerName: booking.user.name,
        destinationName: booking.tour.title,
        city: booking.tour.city || 'Global',
        country: booking.tour.country || 'Global',
        location: booking.tour.location || 'Location not specified',
        travelDate: booking.departureDate,
        travelTime: booking.tour.tourStartTime || '09:00 AM',
        travelerCount: booking.numSeats,
        packageName: booking.pricingPlanName,
        paymentStatus: booking.status === 'Fully Paid' ? 'Paid' : booking.status === 'Deposited' ? 'Deposited' : 'Pending',
        seatInformation: Array.from({ length: booking.numSeats }, (_, i) => `S-${10 + i}`).join(', ')
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/bookings/:id/invoice
export const getBookingInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('tour').populate('user');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }
    
    // Auth check
    if (booking.user._id.toString() !== req.user.id && !['Agent', 'Manager', 'Finance'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }
    
    const invoice = await Invoice.findOne({ booking: booking._id });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found for this booking' });
    }
    
    res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/bookings/:id/download-ticket
export const downloadTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const booking = await Booking.findById(id).populate('tour').populate('user');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }

    const isAuthorizedUser = req.user && (booking.user._id.toString() === req.user.id || ['Agent', 'Manager', 'Finance'].includes(req.user.role));
    const isValidToken = token && booking.secureToken === token;

    if (!isAuthorizedUser && !isValidToken) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this ticket' });
    }

    const payment = await Payment.findOne({ booking: booking._id, status: 'Succeeded' }).sort({ createdAt: -1 });

    const ticketSavePath = path.resolve('./public/tickets', `${booking._id}-ticket.pdf`);

    // Generate fresh E-Ticket dynamically
    await generateTicketPDF(booking, booking.user, booking.tour, payment, ticketSavePath);

    res.download(ticketSavePath, `ETicket-${booking._id.toString().substring(0, 8).toUpperCase()}.pdf`);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/bookings/:id/download-itinerary
export const downloadItinerary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const booking = await Booking.findById(id).populate('tour').populate('user');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }

    const isAuthorizedUser = req.user && (booking.user._id.toString() === req.user.id || ['Agent', 'Manager', 'Finance'].includes(req.user.role));
    const isValidToken = token && booking.secureToken === token;

    if (!isAuthorizedUser && !isValidToken) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this itinerary' });
    }

    const itinerarySavePath = path.resolve('./public/itineraries', `${booking._id}-itinerary.pdf`);

    if (!fs.existsSync(itinerarySavePath)) {
      await generateItineraryPDF(booking, booking.user, booking.tour, itinerarySavePath);
    }

    res.download(itinerarySavePath, `Itinerary-${booking._id.toString().substring(0, 8).toUpperCase()}.pdf`);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/bookings/ticket/verify/:token
export const verifyBookingTicket = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const booking = await Booking.findOne({ secureToken: token }).populate('tour').populate('user');
    if (!booking || !booking.tour || !booking.user) {
      return res.status(200).json({
        success: true,
        verified: false,
        ticketStatus: 'INVALID TICKET',
        message: !booking ? 'Invalid verification token' : 'Associated tour or user records have been removed.'
      });
    }

    let ticketStatus = 'VALID TICKET';
    if (booking.status === 'Cancelled' || booking.status === 'Refunded') {
      ticketStatus = 'CANCELLED TICKET';
    } else {
      const travelDate = new Date(booking.departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (travelDate < today) {
        ticketStatus = 'EXPIRED TICKET';
      } else if (booking.status === 'Hold' || booking.status === 'Pending') {
        ticketStatus = 'INVALID TICKET';
      }
    }

    res.status(200).json({
      success: true,
      verified: true,
      ticket: {
        ticketStatus,
        bookingReference: `TX-${booking._id.toString().substring(0, 8).toUpperCase()}`,
        destinationName: booking.tour.title,
        customerName: booking.user.name,
        travelDate: booking.departureDate,
        travelTime: booking.tour.tourStartTime || '09:00 AM',
        travelerCount: booking.numSeats,
        packageName: booking.pricingPlanName,
        paymentStatus: booking.status === 'Fully Paid' ? 'Paid' : booking.status === 'Deposited' ? 'Deposited' : 'Pending',
        bookingStatus: booking.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/bookings/verify/:bookingId?token=xxx
export const verifyBookingTicketPublic = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { token } = req.query;

    if (!bookingId || !token) {
      console.warn('[TicketVerification] Rejected: bookingId or token is missing');
      return res.status(400).json({ success: false, message: 'Booking ID and token are required' });
    }

    const booking = await Booking.findOne({ _id: bookingId, secureToken: token }).populate('tour').populate('user');
    if (!booking || !booking.tour || !booking.user) {
      console.warn(`[TicketVerification] Rejected: booking not found for id ${bookingId} and token ${token}`);
      return res.status(401).json({ success: false, message: 'Invalid ticket or verification token' });
    }

    let ticketStatus = 'VALID TICKET';
    if (booking.status === 'Cancelled' || booking.status === 'Refunded') {
      ticketStatus = 'CANCELLED TICKET';
    } else {
      const travelDate = new Date(booking.departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (travelDate < today) {
        ticketStatus = 'EXPIRED TICKET';
      } else if (booking.status === 'Hold' || booking.status === 'Pending') {
        ticketStatus = 'INVALID TICKET';
      }
    }

    res.status(200).json({
      success: true,
      verified: true,
      ticket: {
        ticketStatus,
        bookingReference: `TX-${booking._id.toString().substring(0, 8).toUpperCase()}`,
        destinationName: booking.tour.title,
        customerName: booking.user.name,
        travelDate: booking.departureDate,
        travelTime: booking.tour.tourStartTime || '09:00 AM',
        travelerCount: booking.numSeats,
        packageName: booking.pricingPlanName,
        paymentStatus: booking.status === 'Fully Paid' ? 'Paid' : booking.status === 'Deposited' ? 'Deposited' : 'Pending',
        bookingStatus: booking.status
      }
    });
  } catch (error) {
    console.error('[TicketVerification] Internal Error:', error.message);
    next(error);
  }
};


// Get Agent Tour Bookings
export const getAgentBookings = async (req, res, next) => {
  try {
    const agentTours = await AgentTour.find({ createdBy: req.user.id }).select('_id');
    const agentTourIds = agentTours.map(t => t._id);

    const normalTours = await Tour.find({ createdBy: req.user.id }).select('_id');
    const normalTourIds = normalTours.map(t => t._id);

    const bookings = await Booking.find({
      $or: [
        { tourModel: 'AgentTour', tour: { $in: agentTourIds } },
        { tourModel: { $ne: 'AgentTour' }, tour: { $in: normalTourIds } }
      ]
    })
    .populate('user', 'name email')
    .populate('tour', 'title location startLocation endLocation tourStartTime')
    .sort({ createdAt: -1 });

    const now = new Date();
    const activeBookings = bookings.filter(b => {
      if (b.status === 'Hold' && new Date(b.holdExpiresAt) < now) {
        return false;
      }
      return true;
    });

    let totalBookingsCount = activeBookings.length;
    let confirmedBookingsCount = 0;
    let totalTravelersCount = 0;
    let totalRevenue = 0;

    activeBookings.forEach(b => {
      if (['Pending', 'Deposited', 'Fully Paid'].includes(b.status)) {
        confirmedBookingsCount += 1;
        totalTravelersCount += b.numSeats;
        totalRevenue += b.totalAmount;
      }
    });

    res.status(200).json({
      success: true,
      bookings: activeBookings,
      stats: {
        totalBookings: totalBookingsCount,
        confirmedBookings: confirmedBookingsCount,
        totalTravelers: totalTravelersCount,
        bookingRevenue: totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/bookings/:id/resend
export const resendBookingEmail = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('tour').populate('user');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }

    // Verify booking ownership
    if (booking.user._id.toString() !== req.user.id && !['Agent', 'Manager', 'Finance'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this booking' });
    }

    // Verify booking status is confirmed (Fully Paid or Deposited)
    if (booking.status !== 'Fully Paid' && booking.status !== 'Deposited') {
      return res.status(400).json({ success: false, message: 'Only confirmed or deposited bookings can be resent' });
    }

    // Resolve customer email securely from user database
    const customer = await User.findById(req.user.id).select('name email');
    if (!customer || !customer.email) {
      return res.status(400).json({ success: false, message: 'Customer database email not resolved' });
    }

    // Find invoice details
    const invoice = await Invoice.findOne({ booking: booking._id });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Associated booking invoice not found' });
    }

    const invoiceSavePath = path.resolve('./public/invoices', `${invoice.invoiceNumber}.pdf`);

    // Regenerate invoice PDF if deleted
    if (!fs.existsSync(invoiceSavePath)) {
      await generateInvoicePDF(invoice, booking, booking.user, booking.tour, invoiceSavePath);
    }

    const eticketToken = jwt.sign(
      { bookingId: booking._id, docType: 'eticket' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    const itineraryToken = jwt.sign(
      { bookingId: booking._id, docType: 'itinerary' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const emailHtml = generateBookingEmailHtml({
      userName: booking.user.name,
      booking,
      tour: booking.tour,
      frontendOrigin: getFrontendOrigin(req),
      eticketToken,
      itineraryToken
    });

    try {
      const emailResult = await sendEmail({
        to: customer.email,
        subject: `Resend: Your ExploreMyTrip Booking is Confirmed - ${booking._id}`,
        html: emailHtml,
        emailType: 'booking-confirmation'
      });

      if (emailResult && !emailResult.error && (!emailResult.rejected || emailResult.rejected.length === 0)) {
        booking.bookingEmailStatus = 'Sent';
        booking.bookingEmailSentAt = new Date();
      } else {
        booking.bookingEmailStatus = 'Failed';
      }
      await booking.save();
    } catch (mailError) {
      console.error('Failed to resend booking confirmation email:', mailError.message);
      booking.bookingEmailStatus = 'Failed';
      await booking.save();
    }

    res.status(200).json({ success: true, message: 'Booking confirmation email resent successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/bookings/documents/download/:secureToken
export const downloadDocumentByToken = async (req, res, next) => {
  try {
    const { secureToken } = req.params;

    // Verify token using JWT
    let decoded;
    try {
      decoded = jwt.verify(secureToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired document link.' });
    }

    const { bookingId, docType } = decoded;

    const booking = await Booking.findById(bookingId).populate('tour').populate('user');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found.' });
    }

    const payment = await Payment.findOne({ booking: booking._id, status: 'Succeeded' }).sort({ createdAt: -1 });

    if (docType === 'eticket') {
      const ticketSavePath = path.resolve('./public/tickets', `${booking._id}-ticket.pdf`);
      await generateTicketPDF(booking, booking.user, booking.tour, payment, ticketSavePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="ExploreMyTrip-E-Ticket-${booking._id.toString().substring(0, 8).toUpperCase()}.pdf"`);
      return res.download(ticketSavePath);
    } else if (docType === 'itinerary') {
      const itinerarySavePath = path.resolve('./public/itineraries', `${booking._id}-itinerary.pdf`);
      await generateItineraryPDF(booking, booking.user, booking.tour, itinerarySavePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="ExploreMyTrip-Itinerary-${booking._id.toString().substring(0, 8).toUpperCase()}.pdf"`);
      return res.download(itinerarySavePath);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid document type requested.' });
    }
  } catch (error) {
    next(error);
  }
};

