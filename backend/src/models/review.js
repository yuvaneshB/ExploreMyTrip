import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  photos: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  moderationStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Flagged', 'Spam'],
    default: 'Pending'
  },
  isSpam: {
    type: Boolean,
    default: false
  },
  managerReply: {
    type: replySchema,
    default: null
  }
}, {
  timestamps: true
});

// Ensure a user can only review a tour once
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
