import express from 'express';
import {
  createReview,
  getTourReviews,
  getModerationQueue,
  moderateReview,
  replyToReview,
  getReviewAnalytics
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// General review submissions
router.post('/', protect, createReview);

// Moderation routes (Manager only, Agents can view and reply)
router.get('/moderation', protect, authorize('Manager', 'Agent'), getModerationQueue);
router.put('/:id/moderate', protect, authorize('Manager'), moderateReview);
router.post('/:id/reply', protect, authorize('Manager', 'Agent'), replyToReview);

// Public tour specific routes
router.get('/tour/:tourId', getTourReviews);
router.get('/tour/:tourId/analytics', getReviewAnalytics);

export default router;
