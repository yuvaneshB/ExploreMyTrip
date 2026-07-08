import mongoose from 'mongoose';

const departureDateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  heldSeats: { type: Number, default: 0 }
});

const pricingPlanSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 'Standard', 'Deluxe', 'Luxury'
  price: { type: Number, required: true },
  description: { type: String }
});

const seasonalPricingSchema = new mongoose.Schema({
  name: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  priceMultiplier: { type: Number, required: true, default: 1.0 } // e.g., 1.25 for peak season
});

const itineraryDaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  meals: [{ type: String }],
  accommodation: { type: String },
  activity: { type: String }
});

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tour title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Tour description is required']
  },
  durationDays: {
    type: Number,
    required: [true, 'Tour duration in days is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  destinations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  }],
  images: [{
    type: String
  }],
  highlights: [{
    type: String
  }],
  itinerary: [itineraryDaySchema],
  inclusions: [{
    type: String
  }],
  exclusions: [{
    type: String
  }],
  pricingPlans: [pricingPlanSchema], // Multi-tier plans
  seasonalPricing: [seasonalPricingSchema],
  departures: [departureDateSchema],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },
  location: {
    type: String,
    trim: true
  },
  country: {
    type: String
  },
  city: {
    type: String
  },
  destination: {
    type: String
  },
  state: {
    type: String
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  currency: {
    type: String
  },
  timezone: {
    type: String
  },
  startLocation: {
    name: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  endLocation: {
    name: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  averageRating: {
    type: Number,
    default: 4.5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imagePublicId: {
    type: String
  },
  tourStartTime: {
    type: String,
    required: [true, 'Tour start time is required']
  }
}, {
  timestamps: true
});

// Indexing for search performance
tourSchema.index({ title: 'text', description: 'text' });
tourSchema.index({ status: 1 });
tourSchema.index({ category: 1 });
tourSchema.index({ 'departures.date': 1 });

const Tour = mongoose.model('Tour', tourSchema);
export default Tour;
