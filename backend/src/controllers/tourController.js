import Tour from '../models/tour.js';
import AgentTour from '../models/agentTour.js';
import Category from '../models/category.js';
import Destination from '../models/destination.js';
import Wishlist from '../models/wishlist.js';
import City from '../models/city.js';
import Country from '../models/country.js';
import { assignUniqueImages } from '../utilities/imageMatcher.js';
import { deleteFromCloudinary } from '../middleware/upload.js';

// --- Category CRUD ---
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = name.trim();
    // Case-insensitive search for existing category
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp('^' + trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }
    });

    if (existingCategory) {
      return res.status(409).json({ success: false, message: 'Category already exists.' });
    }

    const category = await Category.create({ 
      name: trimmedName, 
      slug: slug || trimmedName.toLowerCase().replace(/ /g, '-'), 
      description, 
      image 
    });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if category is used by standard tours or agent tours
    const standardToursUsing = await Tour.countDocuments({ category: id });
    const agentToursUsing = await AgentTour.countDocuments({ category: id });

    if (standardToursUsing > 0 || agentToursUsing > 0) {
      return res.status(409).json({
        success: false,
        message: 'This category is currently used by existing tours and cannot be removed.'
      });
    }

    await Category.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Category removed successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Destination CRUD ---
export const createDestination = async (req, res, next) => {
  try {
    const { name, city, country, description, images, coordinates, popularAttractions, bestTimeToVisit } = req.body;
    const destination = await Destination.create({
      name, city, country, description, images, coordinates, popularAttractions, bestTimeToVisit
    });
    res.status(201).json({ success: true, destination });
  } catch (error) {
    next(error);
  }
};

export const getDestinations = async (req, res, next) => {
  try {
    const destinations = await Destination.find().populate('city').populate('country');
    res.status(200).json({ success: true, destinations });
  } catch (error) {
    next(error);
  }
};

// --- Tour Core Controllers ---

// Create Tour (Agent / Manager)
export const createTour = async (req, res, next) => {
  try {
    const {
      title, description, durationDays, category, destinations, images, imagePublicId,
      highlights, itinerary, inclusions, exclusions, pricingPlans,
      seasonalPricing, departures, startLocation, endLocation, tourStartTime
    } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Auto-compute available seats for each departure date
    const mappedDepartures = departures?.map(dep => ({
      date: dep.date,
      totalSeats: dep.totalSeats,
      availableSeats: dep.totalSeats,
      heldSeats: 0
    })) || [];

    const tour = await Tour.create({
      title, slug, description, durationDays, category, destinations, images, imagePublicId,
      highlights, itinerary, inclusions, exclusions, pricingPlans,
      seasonalPricing, departures: mappedDepartures, startLocation, endLocation,
      createdBy: req.user._id, tourStartTime
    });

    res.status(201).json({ success: true, message: 'Tour created successfully', tour });
  } catch (error) {
    next(error);
  }
};

// Edit Tour
export const updateTour = async (req, res, next) => {
  try {
    const { id } = req.params;
    let tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    // Role check: Only the creator of the tour or a Manager can edit it
    if (tour.createdBy.toString() !== req.user.id && req.user.role !== 'Manager') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this tour' });
    }

    if (req.body.title) {
      req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (req.body.imagePublicId && req.body.imagePublicId !== tour.imagePublicId) {
      if (tour.imagePublicId) {
        await deleteFromCloudinary(tour.imagePublicId);
      }
    }

    if (req.body.departures) {
      req.body.departures = req.body.departures.map(dep => ({
        date: dep.date,
        totalSeats: dep.totalSeats,
        availableSeats: dep.availableSeats !== undefined ? dep.availableSeats : dep.totalSeats,
        heldSeats: dep.heldSeats || 0
      }));
    }

    tour = await Tour.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: 'Tour updated successfully', tour });
  } catch (error) {
    next(error);
  }
};

// Delete Tour
export const deleteTour = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    const tourOwnerId = tour.createdBy?.toString();
    const loggedInUserId = (req.user?._id || req.user?.id)?.toString();

    const isOwner = tourOwnerId === loggedInUserId;
    const isManager = req.user?.role === 'Manager';

    if (!isOwner && !isManager) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this tour' });
    }

    if (tour.imagePublicId) {
      await deleteFromCloudinary(tour.imagePublicId);
    }

    const tourTitle = tour.title;
    await tour.deleteOne();
    res.status(200).json({ success: true, message: 'Tour deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get Single Tour Details (Public)
export const getTourBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const tour = await AgentTour.findOne({ slug })
      .populate('category')
      .populate({
        path: 'destinations',
        populate: [{ path: 'city' }, { path: 'country' }]
      });

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    const obj = tour.toObject ? tour.toObject() : tour;
    obj.sourceType = 'agent-tour';

    const cleanedTour = assignUniqueImages([obj])[0];
    res.status(200).json({ success: true, tour: cleanedTour });
  } catch (error) {
    next(error);
  }
};

// Advanced Search & Filter API (Public)
export const getAllTours = async (req, res, next) => {
  try {
    const {
      search, category, destination, country, city,
      priceMin, priceMax, durationMin, durationMax, rating,
      sortBy, status
    } = req.query;

    const query = {};

    // Defaults to Published for normal customers, but staff can view draft/archived
    if (status && ['Customer'].includes(req.user?.role)) {
      query.status = 'Published';
    } else if (status) {
      query.status = status;
    } else {
      query.status = 'Published';
    }

    // Text Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Category Filter
    if (category) {
      query.category = category;
    }

    // Destination Filter
    if (destination) {
      query.destinations = destination;
    }

    // Country/City Location queries
    if (country || city) {
      const destQuery = {};
      if (country) destQuery.country = country;
      if (city) destQuery.city = city;

      const matchedDestinations = await Destination.find(destQuery).select('_id');
      const destIds = matchedDestinations.map(d => d._id);
      query.destinations = { $in: destIds };
    }

    // Pricing Filter (evaluating standard pricing plan)
    if (priceMin || priceMax) {
      query['pricingPlans.price'] = {};
      if (priceMin) query['pricingPlans.price'].$gte = Number(priceMin);
      if (priceMax) query['pricingPlans.price'].$lte = Number(priceMax);
    }

    // Duration Filter
    if (durationMin || durationMax) {
      query.durationDays = {};
      if (durationMin) query.durationDays.$gte = Number(durationMin);
      if (durationMax) query.durationDays.$lte = Number(durationMax);
    }

    // Rating Filter
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    // Sort order definition
    let sortOptions = {};
    if (sortBy === 'priceAsc') {
      sortOptions = { 'pricingPlans.0.price': 1 };
    } else if (sortBy === 'priceDesc') {
      sortOptions = { 'pricingPlans.0.price': -1 };
    } else if (sortBy === 'durationAsc') {
      sortOptions = { durationDays: 1 };
    } else if (sortBy === 'durationDesc') {
      sortOptions = { durationDays: -1 };
    } else if (sortBy === 'ratingDesc') {
      sortOptions = { averageRating: -1 };
    } else {
      sortOptions = { createdAt: -1 }; // default newest
    }

    // Agent tours status check
    const agentQuery = { ...query };
    if (status && ['Customer'].includes(req.user?.role)) {
      agentQuery.status = 'Published';
    } else if (status) {
      agentQuery.status = status;
    } else {
      agentQuery.status = 'Published';
    }

    const agentTours = await AgentTour.find(agentQuery)
      .populate('category')
      .populate('destinations')
      .sort(sortOptions);

    let allTours = [...agentTours];

    // Normalize
    allTours = allTours.map(t => {
      const obj = t.toObject ? t.toObject() : t;
      obj.sourceType = t.constructor.modelName === 'AgentTour' ? 'agent-tour' : 'standard-tour';
      obj.location = obj.location || 'Location not specified';
      
      const priceVal = obj.pricingPlans?.[0]?.price ?? obj.price;
      obj.basePrice = typeof priceVal === 'number' && !isNaN(priceVal) ? priceVal : obj.basePrice ?? 0;
      
      let seats = 0;
      if (obj.departures && obj.departures.length > 0) {
        seats = obj.departures.reduce((sum, d) => sum + (d.availableSeats || 0), 0);
      } else {
        seats = obj.availableSeats ?? obj.maxSeats ?? 0;
      }
      obj.availableSeats = seats;

      return obj;
    });

    // De-duplicate by _id
    const seenIds = new Set();
    allTours = allTours.filter(t => {
      const idStr = t._id.toString();
      if (seenIds.has(idStr)) return false;
      seenIds.add(idStr);
      return true;
    });

    // Re-apply sorting on combined array
    if (sortBy === 'priceAsc') {
      allTours.sort((a, b) => (a.pricingPlans?.[0]?.price || 0) - (b.pricingPlans?.[0]?.price || 0));
    } else if (sortBy === 'priceDesc') {
      allTours.sort((a, b) => (b.pricingPlans?.[0]?.price || 0) - (a.pricingPlans?.[0]?.price || 0));
    } else if (sortBy === 'durationAsc') {
      allTours.sort((a, b) => a.durationDays - b.durationDays);
    } else if (sortBy === 'durationDesc') {
      allTours.sort((a, b) => b.durationDays - a.durationDays);
    } else if (sortBy === 'ratingDesc') {
      allTours.sort((a, b) => b.averageRating - a.averageRating);
    } else {
      allTours.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const cleanedTours = assignUniqueImages(allTours);
    res.status(200).json({ success: true, count: cleanedTours.length, tours: cleanedTours });
  } catch (error) {
    next(error);
  }
};

// --- Wishlist Management ---
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    const tours = [];
    if (wishlist && wishlist.tours.length > 0) {
      for (const tourId of wishlist.tours) {
        let tour = await Tour.findById(tourId).populate('category').populate('destinations');
        if (!tour) {
          tour = await AgentTour.findById(tourId).populate('category').populate('destinations');
        }
        if (tour) {
          const obj = tour.toObject ? tour.toObject() : tour;
          obj.sourceType = tour.constructor.modelName === 'AgentTour' ? 'agent-tour' : 'standard-tour';
          tours.push(assignUniqueImages([obj])[0]);
        }
      }
    }
    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully',
      wishlist: tours, // backwards compatibility
      data: tours
    });
  } catch (error) {
    next(error);
  }
};

export const addWishlist = async (req, res, next) => {
  try {
    const tourId = req.body.tourId || req.body.id;
    if (!tourId) {
      return res.status(400).json({ success: false, message: 'Tour ID is required' });
    }

    let tour = await Tour.findById(tourId);
    if (!tour) {
      tour = await AgentTour.findById(tourId);
    }

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, tours: [] });
    }

    // Prevent duplicate entries
    if (wishlist.tours.includes(tourId)) {
      return res.status(200).json({
        success: true,
        message: 'Destination already in wishlist',
        data: wishlist.tours
      });
    }

    wishlist.tours.push(tourId);
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Added to Wishlist',
      data: wishlist.tours
    });
  } catch (error) {
    next(error);
  }
};

export const removeWishlist = async (req, res, next) => {
  try {
    const tourId = req.params.id;
    if (!tourId) {
      return res.status(400).json({ success: false, message: 'Tour ID is required' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    const index = wishlist.tours.indexOf(tourId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Tour not in wishlist' });
    }

    wishlist.tours.splice(index, 1);
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Removed from Wishlist',
      data: wishlist.tours
    });
  } catch (error) {
    next(error);
  }
};


// Compare Tours API
export const compareTours = async (req, res, next) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ success: false, message: 'Tour IDs are required for comparison' });
    }

    const tourIds = ids.split(',');
    const agentTours = await AgentTour.find({ _id: { $in: tourIds } })
      .populate('category')
      .populate('destinations');

    const combined = agentTours.map(t => {
      const obj = t.toObject ? t.toObject() : t;
      obj.sourceType = 'agent-tour';
      return obj;
    });

    res.status(200).json({ success: true, tours: combined });
  } catch (error) {
    next(error);
  }
};

// Get All Countries
export const getCountries = async (req, res, next) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.status(200).json({ success: true, countries });
  } catch (error) {
    next(error);
  }
};

// Get All Cities
export const getCities = async (req, res, next) => {
  try {
    const cities = await City.find().populate('country').sort({ name: 1 });
    res.status(200).json({ success: true, cities });
  } catch (error) {
    next(error);
  }
};
