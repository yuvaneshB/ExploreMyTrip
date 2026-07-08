import { queryDiscoverData } from '../services/discoverService.js';

export const handleDiscoverSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query parameter (q) is required' });
    }

    const data = await queryDiscoverData(q);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};
