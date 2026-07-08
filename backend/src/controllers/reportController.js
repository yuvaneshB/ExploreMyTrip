import Payment from '../models/payment.js';
import Booking from '../models/booking.js';
import Refund from '../models/refund.js';
import Tour from '../models/tour.js';
import AgentTour from '../models/agentTour.js';
import User from '../models/user.js';
import Invoice from '../models/invoice.js';
import Review from '../models/review.js';
import { generateRevenueReportExcel } from '../utilities/excelGenerator.js';
import path from 'path';

// Get Finance Dashboard Overview (Finance & Manager)
export const getFinanceOverview = async (req, res, next) => {
  try {
    const totalSales = await Payment.aggregate([
      { $match: { status: 'Succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalRefunds = await Refund.aggregate([
      { $match: { status: 'Processed' } },
      { $group: { _id: null, total: { $sum: '$refundAmount' } } }
    ]);

    const salesVal = totalSales[0]?.total || 0;
    const refundVal = totalRefunds[0]?.total || 0;
    const netRevenue = salesVal - refundVal;

    // TAX Collected (approx 15% of bookings)
    const bookings = await Booking.find({ status: { $in: ['Deposited', 'Fully Paid'] } });
    const totalTax = bookings.reduce((sum, b) => sum + (b.taxAmount || 0), 0);

    // Today's Sales Calculation
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaySalesAgg = await Payment.aggregate([
      { $match: { status: 'Succeeded', createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const todaySales = todaySalesAgg[0]?.total || 0;

    // Monthly Sales Calculation
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlySalesAgg = await Payment.aggregate([
      { $match: { status: 'Succeeded', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlySalesVal = monthlySalesAgg[0]?.total || 0;

    // Payment counts by status
    const completedPaymentsCount = await Payment.countDocuments({ status: 'Succeeded' });
    const pendingPaymentsCount = await Payment.countDocuments({ status: 'Pending' });
    const failedPaymentsCount = await Payment.countDocuments({ status: 'Failed' });

    // Refund counts by status
    const pendingRefundsCount = await Refund.countDocuments({ status: 'Pending' });
    const approvedRefundsCount = await Refund.countDocuments({ status: 'Processed' });

    // Payment Methods share breakdown
    const paymentMethods = await Payment.aggregate([
      { $group: { _id: '$gateway', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    // Invoice Statistics
    const totalInvoicedAgg = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalInvoiced = totalInvoicedAgg[0]?.total || 0;
    const totalInvoicesCount = await Invoice.countDocuments();

    // Monthly Chart data (restricted to current calendar year)
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const monthlySales = await Payment.aggregate([
      { 
        $match: { 
          status: 'Succeeded',
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        } 
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const chartData = Array(12).fill(0);
    monthlySales.forEach(item => {
      chartData[item._id - 1] = item.total;
    });

    const paymentsList = await Payment.find().populate('user', 'name email');
    const invoicesList = await Invoice.find().populate('booking').populate('user');

    res.status(200).json({
      success: true,
      data: {
        totalSales: salesVal,
        todaySales,
        monthlySales: monthlySalesVal,
        netRevenue,
        totalTax,
        completedPaymentsCount,
        pendingPaymentsCount,
        failedPaymentsCount,
        pendingRefundsCount,
        approvedRefundsCount,
        paymentMethods,
        totalInvoiced,
        totalInvoicesCount,
        chartData,
        payments: paymentsList,
        invoices: invoicesList
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export Revenue Report Excel
export const exportRevenueExcel = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: 'Succeeded' }).populate('user', 'email');
    const filename = `revenue-report-${Date.now()}.xlsx`;
    const savePath = path.join('./public/exports', filename);

    await generateRevenueReportExcel(payments, savePath);
    res.status(200).json({ success: true, downloadUrl: `/uploads/exports/${filename}` });
  } catch (error) {
    next(error);
  }
};

// Request Refund (Customer)
export const requestRefund = async (req, res, next) => {
  try {
    const { bookingId, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const succeededPayment = await Payment.findOne({ booking: bookingId, status: 'Succeeded' });
    if (!succeededPayment) {
      return res.status(400).json({ success: false, message: 'No successful payment found for this booking' });
    }

    const existingRefund = await Refund.findOne({ booking: bookingId });
    if (existingRefund) {
      return res.status(400).json({ success: false, message: 'Refund already requested for this booking' });
    }

    // Dynamic refund calculation based on policy:
    // >= 72 hours: 100% refund
    // 24 to 72 hours: 75% refund (25% surcharge fee)
    // < 24 hours: 0% refund (non-refundable)
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

    const refund = await Refund.create({
      booking: bookingId,
      payment: succeededPayment._id,
      user: req.user.id,
      refundAmount,
      reason: `${reason} [Policy: ${policyApplied}]`
    });

    // Return seats to inventory immediately on cancellation request
    let tour = await Tour.findById(booking.tour);
    if (!tour) {
      tour = await AgentTour.findById(booking.tour);
    }

    if (tour) {
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

    booking.status = 'Cancelled';
    booking.timeline.push({
      status: 'Refund Requested',
      message: `Cancellation and refund request submitted. Reason: ${reason}. Policy Estimate: ${policyApplied}. Estimated Refund: $${refundAmount}`
    });
    await booking.save();

    res.status(201).json({ success: true, message: 'Refund requested successfully', refund });
  } catch (error) {
    next(error);
  }
};

// Approve/Process Refund (Manager / Finance)
export const processRefund = async (req, res, next) => {
  try {
    const { refundId } = req.params;
    const { status, comments } = req.body; // 'Approved', 'Rejected'

    const refund = await Refund.findById(refundId);
    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund request not found' });
    }

    if (refund.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Refund request is already processed' });
    }

    refund.status = status === 'Approved' ? 'Processed' : 'Rejected';
    refund.managerComments = comments || '';
    refund.processedAt = new Date();
    refund.handledBy = req.user.id;
    await refund.save();

    const booking = await Booking.findById(refund.booking);
    if (booking) {
      if (status === 'Approved') {
        booking.status = 'Refunded';
        // Note: Seats were already returned to inventory immediately during the cancellation request.
        // We do not increment them again here to avoid double-counting seats.
      } else {
        // If rejected, the booking remains Cancelled (the user did request cancellation), 
        // but no refund is processed.
        booking.status = 'Cancelled';
      }
      booking.timeline.push({
        status: refund.status === 'Processed' ? 'Refunded' : 'Refund Rejected',
        message: `Refund review: ${refund.status}. Reviewer comment: ${comments}`
      });
      await booking.save();
    }

    res.status(200).json({ success: true, message: `Refund request updated to: ${refund.status}`, refund });
  } catch (error) {
    next(error);
  }
};

// Get All Refunds list
export const getAllRefunds = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role !== 'Finance' && req.user.role !== 'Manager') {
      filter = { user: req.user.id };
    }
    
    const refunds = await Refund.find(filter)
      .populate('user', 'name email')
      .populate({
        path: 'booking',
        populate: { path: 'tour' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, refunds });
  } catch (error) {
    next(error);
  }
};

// Dashboard KPI Analytics (Manager Overview)
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const totalTours = await AgentTour.countDocuments();
    const publishedTours = await AgentTour.countDocuments({ status: 'Published' });
    const pendingTours = await AgentTour.countDocuments({ status: 'Pending' });
    const upcomingTours = await AgentTour.countDocuments({ status: 'Upcoming' });

    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    const totalAgents = await User.countDocuments({ role: 'Agent' });
    const totalBookings = await Booking.countDocuments();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayBookings = await Booking.countDocuments({ createdAt: { $gte: startOfToday } });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['Deposited', 'Fully Paid', 'Hold'] } });

    const pendingRequests = await Refund.countDocuments({ status: 'Pending' });
    const totalReviews = await Review.countDocuments();

    const avgRatingAgg = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    const avgRating = avgRatingAgg[0]?.avg ? Math.round(avgRatingAgg[0].avg * 10) / 10 : 4.5;

    // Top destinations calculation
    const topDestinations = await Booking.aggregate([
      { $group: { _id: '$tour', count: { $sum: '$numSeats' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'tours', localField: '_id', foreignField: '_id', as: 'tourInfo' } },
      { $unwind: '$tourInfo' }
    ]);

    const formattedDestinations = topDestinations.map(item => ({
      title: item.tourInfo.title,
      seatsBooked: item.count
    }));

    res.status(200).json({
      success: true,
      analytics: {
        totalTours,
        publishedTours,
        pendingTours,
        upcomingTours,
        totalCustomers,
        totalAgents,
        totalBookings,
        todayBookings,
        activeBookings,
        pendingRequests,
        totalReviews,
        avgRating,
        topDestinations: formattedDestinations
      }
    });
  } catch (error) {
    next(error);
  }
};

// List all non-customer users as staff
export const getStaffList = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $ne: 'Customer' } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};
