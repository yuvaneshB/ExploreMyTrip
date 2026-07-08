import { fetchCountryData } from '../services/countryService.js';

export const getCountryDetails = async (req, res, next) => {
  try {
    const { country } = req.params;
    if (!country) {
      return res.status(400).json({ success: false, message: 'Country parameter is required' });
    }

    const data = await fetchCountryData(country);
    res.status(200).json({ success: true, country: data });
  } catch (error) {
    next(error);
  }
};
