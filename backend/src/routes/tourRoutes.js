import express from 'express';
import {
  createCategory,
  getCategories,
  deleteCategory,
  createDestination,
  getDestinations,
  createTour,
  updateTour,
  deleteTour,
  getTourBySlug,
  getAllTours,
  getWishlist,
  addWishlist,
  removeWishlist,
  compareTours,
  getCountries,
  getCities
} from '../controllers/tourController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

import { uploadTourImage, uploadToCloudinary } from '../middleware/upload.js';

const router = express.Router();

// Countries & Cities routes
router.get('/countries', getCountries);
router.get('/cities', getCities);

// Categories routes
router.route('/categories')
  .post(protect, authorize('Agent', 'Manager'), createCategory)
  .get(getCategories);

router.route('/categories/:id')
  .delete(protect, authorize('Agent', 'Manager'), deleteCategory);

// Destinations routes
router.route('/destinations')
  .post(protect, authorize('Agent', 'Manager'), createDestination)
  .get(getDestinations);

// Global public queries
router.get('/compare', compareTours);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, addWishlist);
router.delete('/wishlist/:id', protect, removeWishlist);

// Image Upload route (Agent / Manager)
router.post('/upload-image', protect, authorize('Agent', 'Manager'), (req, res, next) => {
  uploadTourImage.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Image must be under 10MB.' });
      }
      return res.status(400).json({ success: false, message: err.message || 'File upload failed.' });
    }
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a tour cover image.' });
    }
    const result = await uploadToCloudinary(req.file.path, 'tours');
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: result.url,
      public_id: result.public_id
    });
  } catch (error) {
    next(error);
  }
});


// Core Tour routes
router.route('/')
  .post(protect, authorize('Agent', 'Manager'), createTour)
  .get(getAllTours);

router.get('/:slug', getTourBySlug);

router.route('/:id')
  .put(protect, authorize('Agent', 'Manager'), updateTour)
  .delete(protect, authorize('Agent', 'Manager'), deleteTour);


export default router;
