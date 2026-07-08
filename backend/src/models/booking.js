import mongoose from 'mongoose';
import crypto from 'crypto';

const travelerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  passportNumber: { type: String, required: true },
  passportExpiry: { type: Date, required: true }
}, { _id: false });

const addonSchema = new mongoose.Schema({
  airportPickup: { type: Boolean, default: false },
  travelInsurance: { type: Boolean, default: false },
  hotelUpgrade: { type: Boolean, default: false },
  roomSelection: { type: String, enum: ['Single', 'Double', 'Twin', 'None'], default: 'None' }
}, { _id: false });

const timelineEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'tourModel'
  },
  tourModel: {
    type: String,
    required: true,
    enum: ['Tour', 'AgentTour'],
    default: 'Tour'
  },
  departureDate: {
    type: Date,
    required: true
  },
  pricingPlanName: {
    type: String,
    required: true // 'Standard', 'Deluxe', 'Luxury'
  },
  numSeats: {
    type: Number,
    required: true,
    min: 1
  },
  travelers: [travelerSchema],
  addons: {
    type: addonSchema,
    default: () => ({})
  },
  subTotal: {
    type: Number,
    required: true
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  couponApplied: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null
  },
  status: {
    type: String,
    enum: ['Hold', 'Pending', 'Deposited', 'Fully Paid', 'Cancelled', 'Refunded'],
    default: 'Hold'
  },
  holdExpiresAt: {
    type: Date,
    required: true // Used for 15-minute seat reservation
  },
  timeline: [timelineEventSchema],
  paymentRetryCount: {
    type: Number,
    default: 0
  },
  bookingEmailStatus: {
    type: String,
    enum: ['Pending', 'Sent', 'Failed'],
    default: 'Pending'
  },
  bookingEmailSentAt: {
    type: Date,
    default: null
  },
  secureToken: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

bookingSchema.pre('save', function(next) {
  if (!this.secureToken) {
    this.secureToken = crypto.randomBytes(24).toString('hex');
  }
  next();
});


const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
