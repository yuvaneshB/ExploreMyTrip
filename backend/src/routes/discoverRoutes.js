import express from 'express';
import { handleDiscoverSearch } from '../controllers/discoverController.js';

const router = express.Router();

router.get('/', handleDiscoverSearch);

export default router;
