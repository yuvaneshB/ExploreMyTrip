import Review from '../models/review.js';
import Tour from '../models/tour.js';
import AgentTour from '../models/agentTour.js';

// Add Review (Customer)
export const createReview = async (req, res, next) => {
  try {
    const { tourId, rating, title, comment, photos, videos } = req.body;

    let tour = await Tour.findById(tourId);
    if (!tour) {
      tour = await AgentTour.findById(tourId);
    }

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    // Check if user has already reviewed this tour
    const existingReview = await Review.findOne({ user: req.user.id, tour: tourId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this tour' });
    }

    // Simple Rule-Based Spam Detection
    const spamWords = ['buy', 'cheap', 'discount', 'free money', 'viagra', 'cryptocurrency', 'earn'];
    const lowerComment = comment.toLowerCase();
    let isSpam = false;

    // Check for spam words
    for (const word of spamWords) {
      if (lowerComment.includes(word)) {
        isSpam = true;
        break;
      }
    }

    // Check for repetitive chars
    if (comment.replace(/[^!]/g, "").length > 5) {
      isSpam = true;
    }

    const review = await Review.create({
      user: req.user.id,
      tour: tourId,
      rating,
      title,
      comment,
      photos: photos || [],
      videos: videos || [],
      isSpam,
      moderationStatus: isSpam ? 'Spam' : 'Pending'
    });

    res.status(201).json({
      success: true,
      message: isSpam
        ? 'Review submitted. Flagged by spam filter for moderation.'
        : 'Review submitted. Awaiting moderation.',
      review
    });
  } catch (error) {
    next(error);
  }
};

// Get Approved Reviews for a Tour (Public)
export const getTourReviews = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const reviews = await Review.find({ tour: tourId, moderationStatus: 'Approved' })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// Get All Reviews for Moderation (Manager only)
export const getModerationQueue = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('tour', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// Moderate Review (Manager only)
export const moderateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved', 'Flagged', 'Spam'

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.moderationStatus = status;
    if (status === 'Spam') {
      review.isSpam = true;
    } else {
      review.isSpam = false;
    }
    await review.save();

    // Recompute Tour average rating if Approved
    if (status === 'Approved') {
      const tourId = review.tour;
      const stats = await Review.aggregate([
        { $match: { tour: tourId, moderationStatus: 'Approved' } },
        { $group: { _id: '$tour', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);

      if (stats.length > 0) {
        let updatedTour = await Tour.findByIdAndUpdate(tourId, {
          averageRating: Math.round(stats[0].avgRating * 10) / 10,
          numReviews: stats[0].count
        });
        if (!updatedTour) {
          await AgentTour.findByIdAndUpdate(tourId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            numReviews: stats[0].count
          });
        }
      }
    }

    res.status(200).json({ success: true, message: `Review status updated to ${status}`, review });
  } catch (error) {
    next(error);
  }
};

// Manager Reply to Review (Manager only)
export const replyToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.managerReply = {
      user: req.user.id,
      text,
      createdAt: new Date()
    };

    await review.save();
    res.status(200).json({ success: true, message: 'Reply posted successfully', review });
  } catch (error) {
    next(error);
  }
};

// Get Review Analytics (Public/Manager)
export const getReviewAnalytics = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const ratingsBreakdown = await Review.aggregate([
      { $match: { tour: tourId, moderationStatus: 'Approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    const formattedBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingsBreakdown.forEach(item => {
      formattedBreakdown[item._id] = item.count;
    });

    res.status(200).json({ success: true, breakdown: formattedBreakdown });
  } catch (error) {
    next(error);
  }
};
