import AgentTour from '../models/agentTour.js';
import { deleteFromCloudinary } from '../middleware/upload.js';
import { assignUniqueImages } from '../utilities/imageMatcher.js';

// CREATE
export const createAgentTour = async (req, res, next) => {
  try {
    const {
      title, description, durationDays, category, destinations, images, imagePublicId,
      highlights, inclusions, exclusions, pricingPlans, departures, startLocation, endLocation,
      location, tourStartTime
    } = req.body;

    if (!location || location.trim() === '') {
      return res.status(400).json({ success: false, message: 'Tour location is required.' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Auto-compute available seats for departures
    const mappedDepartures = departures?.map(dep => ({
      date: dep.date,
      totalSeats: dep.totalSeats,
      availableSeats: dep.totalSeats,
      heldSeats: 0
    })) || [];

    // Backend-assigned ownership: req.user._id
    const tour = await AgentTour.create({
      title, slug, description, durationDays, category, destinations, images, imagePublicId,
      highlights, inclusions, exclusions, pricingPlans, departures: mappedDepartures,
      startLocation, endLocation, createdBy: req.user._id,
      location: location.trim(), tourStartTime
    });

    const cleanedTour = assignUniqueImages([tour])[0];
    res.status(201).json({ success: true, message: 'Agent tour created successfully', tour: cleanedTour });
  } catch (error) {
    next(error);
  }
};

// READ - GET LOGGED-IN AGENT'S RECORDS
export const getAgentTours = async (req, res, next) => {
  try {
    // Only query records belonging to the authenticated agent
    const tours = await AgentTour.find({ createdBy: req.user._id })
      .populate('category')
      .populate('destinations');

    const cleanedTours = assignUniqueImages(tours);
    res.status(200).json({ success: true, tours: cleanedTours });
  } catch (error) {
    next(error);
  }
};

// READ - GET ONE RECORD (OWNERSHIP PROTECTED)
export const getAgentTourById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tour = await AgentTour.findById(id).populate('category').populate('destinations');

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Agent tour not found' });
    }

    // Ownership check using safe comparison
    const ownerId = tour.createdBy?.toString();
    const authenticatedAgentId = (req.user?._id || req.user?.id)?.toString();

    if (ownerId !== authenticatedAgentId) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this record' });
    }

    const cleanedTour = assignUniqueImages([tour])[0];
    res.status(200).json({ success: true, tour: cleanedTour });
  } catch (error) {
    next(error);
  }
};

// UPDATE (OWNERSHIP PROTECTED)
export const updateAgentTour = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tour = await AgentTour.findById(id);

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Agent tour not found' });
    }

    // Ownership check using safe comparison
    const ownerId = tour.createdBy?.toString();
    const authenticatedAgentId = (req.user?._id || req.user?.id)?.toString();

    if (ownerId !== authenticatedAgentId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this record' });
    }

    // Prevent modification of the ownership field
    const updates = { ...req.body };
    delete updates.createdBy;

    if (updates.location !== undefined) {
      if (updates.location === null || updates.location.trim() === '') {
        return res.status(400).json({ success: false, message: 'Tour location is required.' });
      }
      updates.location = updates.location.trim();
    }

    if (updates.departures) {
      updates.departures = updates.departures.map(dep => ({
        date: dep.date,
        totalSeats: dep.totalSeats,
        availableSeats: dep.availableSeats !== undefined ? dep.availableSeats : dep.totalSeats,
        heldSeats: dep.heldSeats || 0
      }));
    }

    if (updates.title) {
      updates.slug = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Image cleanup if image changes
    if (updates.imagePublicId && updates.imagePublicId !== tour.imagePublicId) {
      if (tour.imagePublicId) {
        await deleteFromCloudinary(tour.imagePublicId);
      }
    }

    const updatedTour = await AgentTour.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    const cleanedTour = assignUniqueImages([updatedTour])[0];
    res.status(200).json({ success: true, message: 'Agent tour updated successfully', tour: cleanedTour });
  } catch (error) {
    next(error);
  }
};

// DELETE (OWNERSHIP PROTECTED)
export const deleteAgentTour = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tour = await AgentTour.findById(id);

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Agent tour not found' });
    }

    // Ownership check using safe comparison
    const ownerId = tour.createdBy?.toString();
    const authenticatedAgentId = (req.user?._id || req.user?.id)?.toString();

    if (ownerId !== authenticatedAgentId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this record' });
    }

    // Image cleanup if image exists
    if (tour.imagePublicId) {
      await deleteFromCloudinary(tour.imagePublicId);
    }

    await tour.deleteOne();
    res.status(200).json({ success: true, message: 'Agent tour deleted successfully' });
  } catch (error) {
    next(error);
  }
};
