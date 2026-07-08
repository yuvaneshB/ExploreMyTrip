import express from 'express';
import { getCountryDetails } from '../controllers/countryController.js';

const router = express.Router();

router.get('/:country', getCountryDetails);

export default router;
