import express from 'express';
import { searchDestinations, getDestinationDetails, ensureDestinationTour, getTrendingDestinations } from '../controllers/destinationController.js';

const router = express.Router();

router.get('/search', searchDestinations);
router.get('/details', getDestinationDetails);
router.post('/ensure', ensureDestinationTour);
router.get('/trending', getTrendingDestinations);

export default router;
