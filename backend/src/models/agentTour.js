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

const agentTourSchema = new mongoose.Schema({
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
  location: {
    type: String,
    trim: true
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
  inclusions: [{
    type: String
  }],
  exclusions: [{
    type: String
  }],
  pricingPlans: [pricingPlanSchema],
  departures: [departureDateSchema],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
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
  timestamps: true,
  collection: 'agenttours'
});

agentTourSchema.index({ title: 'text', description: 'text' });
agentTourSchema.index({ createdBy: 1 });
agentTourSchema.index({ status: 1 });

const AgentTour = mongoose.model('AgentTour', agentTourSchema);
export default AgentTour;
