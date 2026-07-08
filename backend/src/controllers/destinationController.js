import Destination from '../models/destination.js';
import Tour from '../models/tour.js';
import AgentTour from '../models/agentTour.js';
import Category from '../models/category.js';
import Country from '../models/country.js';
import City from '../models/city.js';
import User from '../models/user.js';
import { queryDiscoverData } from '../services/discoverService.js';
import { assignUniqueImages } from '../utilities/imageMatcher.js';
import axios from 'axios';

const trendingImageCache = {};

// GET /api/destinations/search?q={query}
export const searchDestinations = async (req, res, next) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';
    console.log(`[DestinationSearch] Incoming search request`);
    console.log(`[DestinationSearch] Search keyword: "${q}"`);

    const results = [];
    const seenNames = new Set();

    // 1. Search Local Database Tours (Published only)
    const tourQuery = { status: 'Published' };
    if (q) {
      tourQuery.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { country: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } },
        { state: { $regex: q, $options: 'i' } },
        { 'startLocation.name': { $regex: q, $options: 'i' } },
        { 'endLocation.name': { $regex: q, $options: 'i' } }
      ];
    }
    console.log(`[DestinationSearch] Database query for local tours: ${JSON.stringify(tourQuery)}`);

    // Query AgentTours only
    const agentTours = await AgentTour.find(tourQuery)
      .populate('category')
      .populate('destinations');
    console.log(`[DestinationSearch] Number of Agent tours found: ${agentTours.length}`);

    for (const tour of agentTours) {
      const nameKey = tour.title.toLowerCase();
      if (!seenNames.has(nameKey)) {
        seenNames.add(nameKey);
        const basePrice = tour.pricingPlans?.[0]?.price || 120;
        results.push({
          name: tour.title,
          country: tour.country || 'Global',
          city: tour.city || 'Global',
          location: tour.location || 'Location not specified',
          category: tour.category?.name || 'Adventure',
          image: tour.images?.[0] || '',
          rating: tour.averageRating || 4.5,
          reviewsCount: tour.numReviews || Math.floor(12 + Math.random() * 80),
          price: basePrice,
          duration: `${tour.durationDays} Days`,
          coordinates: {
            latitude: tour.latitude || tour.startLocation?.latitude || 0,
            longitude: tour.longitude || tour.startLocation?.longitude || 0
          },
          description: tour.description,
          isLocal: true,
          id: tour._id.toString(),
          slug: tour.slug,
          images: tour.images || [],
          sourceType: 'agent-tour'
        });
      }
    }

    console.log(`[DestinationSearch] Final response count (de-duplicated): ${results.length}`);

    const cleanedResults = assignUniqueImages(results);
    res.status(200).json({
      success: true,
      total: cleanedResults.length,
      data: cleanedResults
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/destinations/details?name={name}&city={city}&country={country}
export const getDestinationDetails = async (req, res, next) => {
  try {
    const { name, city, country } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Attraction/Destination name is required' });
    }

    // 1. Check if it matches a local tour title
    const localTour = await AgentTour.findOne({ title: name }).populate('category').populate('destinations');
    if (localTour) {
      const basePrice = localTour.pricingPlans?.[0]?.price || 120;
      const dataObj = {
        name: localTour.title,
        country: localTour.country || 'Global',
        city: localTour.city || 'Global',
        location: localTour.location || 'Location not specified',
        category: localTour.category?.name || 'Adventure',
        image: localTour.images?.[0] || '',
        images: localTour.images || [],
        rating: localTour.averageRating || 4.5,
        reviewsCount: localTour.numReviews || 24,
        price: basePrice,
        duration: `${localTour.durationDays} Days`,
        coordinates: {
          latitude: localTour.latitude || localTour.startLocation?.latitude || 0,
          longitude: localTour.longitude || localTour.startLocation?.longitude || 0
        },
        description: localTour.description,
        isLocal: true,
        id: localTour._id.toString(),
        slug: localTour.slug,
        details: {
          openingHours: '09:00 AM - 06:00 PM',
          entryFee: `$${basePrice}`,
          weather: { temperature: 22, condition: 'Sunny', humidity: 55, windSpeed: 12 },
          bestTimeToVisit: 'Spring or Autumn',
          safety: 'High safety standards.',
          transport: 'Bus, Taxi, Guided transfer',
          languages: 'English',
          currency: 'USD ($)'
        }
      };

      const cleanedData = assignUniqueImages([dataObj])[0];
      return res.status(200).json({
        success: true,
        data: cleanedData
      });
    }

    // 2. Fetch dynamically from Discover service using city name or country name as query
    const searchQuery = city || country || name;
    const discoverData = await queryDiscoverData(searchQuery);

    if (discoverData && discoverData.attractions) {
      const attraction = discoverData.attractions.find(
        a => a.name.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(a.name.toLowerCase())
      ) || discoverData.attractions[0];

      if (attraction) {
        let parsedPrice = 15;
        if (attraction.entryFee && attraction.entryFee.toLowerCase() !== 'free') {
          const numeric = parseInt(attraction.entryFee.replace(/[^0-9]/g, ''));
          if (numeric && !isNaN(numeric)) {
            parsedPrice = numeric;
          }
        }

        const dataObj = {
          name: attraction.name,
          country: discoverData.destination.country || country || 'Global',
          city: discoverData.destination.name || city || 'Global',
          category: attraction.category || 'Sightseeing',
          image: attraction.image || '',
          images: attraction.image ? [attraction.image] : [],
          rating: attraction.rating || 4.5,
          reviewsCount: Math.floor(35 + Math.random() * 850),
          price: parsedPrice,
          duration: attraction.duration || '2 Hours',
          coordinates: {
            latitude: attraction.coordinates?.latitude || discoverData.destination.coordinates?.latitude || 0,
            longitude: attraction.coordinates?.longitude || discoverData.destination.coordinates?.longitude || 0
          },
          description: attraction.description,
          isLocal: false,
          id: `dynamic_${attraction.name.replace(/\s+/g, '_')}`,
          slug: '',
          details: {
            openingHours: attraction.openingHours || '09:00 AM - 05:00 PM',
            entryFee: attraction.entryFee || 'Free',
            weather: discoverData.destination.weather,
            bestTimeToVisit: discoverData.destination.bestTimeToVisit || 'All Year Round',
            safety: discoverData.destination.safety || 'Safe.',
            transport: discoverData.destination.transport || 'Local trains and taxis.',
            languages: discoverData.destination.languages || 'English',
            currency: discoverData.destination.currency || 'USD ($)'
          }
        };

        const cleanedData = assignUniqueImages([dataObj])[0];
        return res.status(200).json({
          success: true,
          data: cleanedData
        });
      }
    }

    res.status(404).json({ success: false, message: 'Attraction details not found.' });
  } catch (error) {
    next(error);
  }
};


// POST /api/destinations/ensure
// Ensure dynamic attraction exists in MERN database
export const ensureDestinationTour = async (req, res, next) => {
  try {
    const { name, country, city, category, image, rating, price, duration, description, coordinates } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Destination name is required' });
    }

    // 1. Check if an Agent Tour matches title
    const existingTour = await AgentTour.findOne({ title: name }).populate('category');
    if (existingTour) {
      return res.status(200).json({ success: true, tourId: existingTour._id, slug: existingTour.slug });
    }

    return res.status(404).json({ success: false, message: 'Tour not found' });

    console.log(`[DestinationController] Ensuring database records for dynamic attraction: ${name}`);

    // 2. Ensure Category
    const catName = category || 'Sightseeing';
    let dbCategory = await Category.findOne({ name: { $regex: new RegExp(`^${catName}$`, 'i') } });
    if (!dbCategory) {
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      dbCategory = await Category.create({
        name: catName,
        slug: catSlug,
        description: `Discovery tours and experiences for ${catName}`
      });
    }

    // 3. Ensure Country
    const countryName = country || 'Global';
    let dbCountry = await Country.findOne({ name: { $regex: new RegExp(`^${countryName}$`, 'i') } });
    if (!dbCountry) {
      let code = countryName.slice(0, 2).toUpperCase();
      // Handle potential duplicate country codes
      const existingCode = await Country.findOne({ code });
      if (existingCode) {
        code = code + Math.floor(Math.random() * 10);
      }
      dbCountry = await Country.create({
        name: countryName,
        code,
        description: `Explore tourist attractions across ${countryName}`
      });
    }

    // 4. Ensure City
    const cityName = city || 'Global';
    let dbCity = await City.findOne({ name: { $regex: new RegExp(`^${cityName}$`, 'i') }, country: dbCountry._id });
    if (!dbCity) {
      dbCity = await City.create({
        name: cityName,
        country: dbCountry._id,
        description: `Attractions and spots in ${cityName}`
      });
    }

    // 5. Ensure Destination
    let dbDest = await Destination.findOne({ name });
    if (!dbDest) {
      dbDest = await Destination.create({
        name,
        city: dbCity._id,
        country: dbCountry._id,
        description: description || `Discover the beauty of ${name}`,
        images: image ? [image] : [],
        coordinates: {
          latitude: coordinates?.latitude || 0,
          longitude: coordinates?.longitude || 0
        },
        bestTimeToVisit: 'All Year Round'
      });
    }

    // 6. Find a staff user to act as creator
    const creatorUser = await User.findOne({ role: { $in: ['Agent', 'Manager'] } });
    if (!creatorUser) {
      return res.status(500).json({ success: false, message: 'Database error: No travel agent or manager account found to assign the tour.' });
    }

    // 7. Parse durationDays
    let durationDays = 1;
    if (duration) {
      const match = duration.match(/(\d+)\s*(day|days|hour|hours)/i);
      if (match) {
        const num = parseInt(match[1]);
        if (match[2].toLowerCase().startsWith('day')) {
          durationDays = num;
        } else {
          durationDays = Math.max(1, Math.ceil(num / 8)); // 8 hours = 1 day
        }
      }
    }

    // 8. Create standard Pricing Plans
    const parsedPrice = Number(price) || 50;
    const pricingPlans = [
      { name: 'Standard', price: parsedPrice, description: 'Standard admission and self-guided tour' },
      { name: 'Deluxe', price: Math.round(parsedPrice * 1.5), description: 'Includes fast-track admission and audio guide' },
      { name: 'Luxury', price: Math.round(parsedPrice * 2.5), description: 'VIP entry, skip-the-line, and private expert guide' }
    ];

    // 9. Create upcoming Departure dates (e.g. next month)
    const departures = [
      { date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), totalSeats: 25, availableSeats: 25, heldSeats: 0 },
      { date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), totalSeats: 25, availableSeats: 25, heldSeats: 0 },
      { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), totalSeats: 25, availableSeats: 25, heldSeats: 0 }
    ];

    // 10. Generate slug
    const tourSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // 11. Create Tour
    const newTour = await Tour.create({
      title: name,
      slug: tourSlug,
      description: description || `Experience a premium guided tour around ${name}. Explore its history, highlights, and surroundings with our local experts.`,
      durationDays,
      category: dbCategory._id,
      destinations: [dbDest._id],
      images: image ? [image] : [],
      highlights: ['Local Tour Guide Fee Included', 'Skip-the-line Admission Ticket', 'Perfect Photo Opportunities'],
      pricingPlans,
      departures,
      status: 'Published',
      country: countryName,
      city: cityName,
      destination: name,
      latitude: coordinates?.latitude || 0,
      longitude: coordinates?.longitude || 0,
      averageRating: rating || 4.5,
      numReviews: 1,
      createdBy: creatorUser._id,
      startLocation: { name: `${name} Entrance`, latitude: coordinates?.latitude || 0, longitude: coordinates?.longitude || 0 }
    });

    res.status(201).json({
      success: true,
      tourId: newTour._id,
      slug: newTour.slug
    });
  } catch (error) {
    next(error);
  }
};

// Helper to dynamically resolve high-quality Wikipedia images
const resolveWikiImage = async (name) => {
  const normalized = name.trim();
  
  // Try 1: Direct summary fetch for the page
  try {
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(normalized)}`;
    const res = await axios.get(summaryUrl, {
      headers: { 'User-Agent': 'ExploreMyTripPlatform/1.0 (contact@exploremytrip.com)' },
      timeout: 2000
    });
    const img = res.data?.originalimage?.source || res.data?.thumbnail?.source;
    if (img) return img;
  } catch (err) {
    // Ignore and proceed
  }

  // Try 2: Wikipedia Search with "India tourism destination"
  try {
    const searchQuery = `${normalized} India tourism destination`;
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`;
    const searchRes = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'ExploreMyTripPlatform/1.0 (contact@exploremytrip.com)' }
    });

    const searchResults = searchRes.data?.query?.search;
    if (searchResults && searchResults.length > 0) {
      const title = searchResults[0].title;
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const summaryRes = await axios.get(summaryUrl, {
        headers: { 'User-Agent': 'ExploreMyTripPlatform/1.0 (contact@exploremytrip.com)' },
        timeout: 2000
      });
      const img = summaryRes.data?.originalimage?.source || summaryRes.data?.thumbnail?.source;
      if (img) return img;
    }
  } catch (err) {
    // Ignore and proceed
  }

  // Try 3: General search fallback
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(normalized)}&format=json&origin=*`;
    const searchRes = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'ExploreMyTripPlatform/1.0 (contact@exploremytrip.com)' }
    });
    const searchResults = searchRes.data?.query?.search;
    if (searchResults && searchResults.length > 0) {
      const title = searchResults[0].title;
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const summaryRes = await axios.get(summaryUrl, {
        headers: { 'User-Agent': 'ExploreMyTripPlatform/1.0 (contact@exploremytrip.com)' },
        timeout: 2000
      });
      const img = summaryRes.data?.originalimage?.source || summaryRes.data?.thumbnail?.source;
      if (img) return img;
    }
  } catch (err) {
    // Ignore
  }

  return null;
};

// GET /api/destinations/trending
export const getTrendingDestinations = async (req, res, next) => {
  try {
    const publishedTours = await AgentTour.find({ status: 'Published' }).populate('category');
    
    // 7 iconic Indian tourist destinations with optimized location-specific images
    const fallbackList = [
      {
        name: 'Goa',
        country: 'India',
        tagline: 'Golden beaches, Portuguese forts, seafood feasts & vibrant nightlife.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/BeachFun.jpg/800px-BeachFun.jpg',
        rating: 4.7,
        reviewsCount: 1920,
        price: 110
      },
      {
        name: 'Jaipur',
        country: 'India',
        tagline: 'Pink City — royal palaces, majestic hill forts and rich heritage.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/800px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg',
        rating: 4.8,
        reviewsCount: 1650,
        price: 180
      },
      {
        name: 'Manali',
        country: 'India',
        tagline: 'Scenic mountain valley with snow peaks, river rafting and adventure trails.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Manali_City.jpg/800px-Manali_City.jpg',
        rating: 4.9,
        reviewsCount: 1120,
        price: 150
      },
      {
        name: 'Kerala',
        country: 'India',
        tagline: 'God\'s Own Country — emerald backwaters, spice forests & houseboat serenity.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Boathouse_%287063399547%29.jpg/800px-Boathouse_%287063399547%29.jpg',
        rating: 4.8,
        reviewsCount: 1280,
        price: 140
      },
      {
        name: 'Agra',
        country: 'India',
        tagline: 'Home of the Taj Mahal — majestic Mughal monuments & historic heritage.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Taj_Mahal%2C_Agra%2C_India.jpg/800px-Taj_Mahal%2C_Agra%2C_India.jpg',
        rating: 4.9,
        reviewsCount: 2150,
        price: 130
      },
      {
        name: 'Varanasi',
        country: 'India',
        tagline: 'Spiritual heart of India — ancient ghats, ganga aarti & sacred temples.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg/800px-Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg',
        rating: 4.8,
        reviewsCount: 940,
        price: 90
      },
      {
        name: 'Mumbai',
        country: 'India',
        tagline: 'City of dreams — colonial architecture, marine drive and Bollywood energy.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Mumbai_Bandra-Worli_Sea_Link.jpg/800px-Mumbai_Bandra-Worli_Sea_Link.jpg',
        rating: 4.7,
        reviewsCount: 2310,
        price: 160
      }
    ];

    const results = [];
    const seenNames = new Set();

    const defaultSlug = publishedTours.length > 0 ? publishedTours[0].slug : 'swiss-alps-adventure';
    const defaultId = publishedTours.length > 0 ? publishedTours[0]._id.toString() : 'mock_id';

    // Map each fallback destination
    for (const fb of fallbackList) {
      const nameKey = fb.name.toLowerCase();
      if (!seenNames.has(nameKey)) {
        seenNames.add(nameKey);
        
        // Find if we have a published tour matching the fallback name
        const matchingTour = publishedTours.find(
          t => t.title.toLowerCase().includes(fb.name.toLowerCase()) || 
               t.city?.toLowerCase().includes(fb.name.toLowerCase()) || 
               t.country?.toLowerCase().includes(fb.name.toLowerCase())
        );

        let finalImage = '';
        if (trendingImageCache[fb.name]) {
          finalImage = trendingImageCache[fb.name];
        } else {
          try {
            finalImage = await resolveWikiImage(fb.name);
          } catch (err) {
            console.warn(`Wikipedia image fetch failed for ${fb.name}:`, err.message);
          }
          if (finalImage) {
            trendingImageCache[fb.name] = finalImage;
          } else {
            finalImage = fb.image;
          }
        }

        results.push({
          name: fb.name,
          country: fb.country,
          tagline: fb.tagline,
          image: finalImage,
          images: finalImage ? [finalImage] : [],
          rating: matchingTour?.averageRating || fb.rating,
          reviewsCount: matchingTour?.numReviews || fb.reviewsCount,
          price: matchingTour ? (matchingTour.pricingPlans?.[0]?.price || fb.price) : fb.price,
          isLocal: matchingTour ? true : false,
          id: matchingTour ? matchingTour._id.toString() : defaultId,
          slug: matchingTour ? matchingTour.slug : defaultSlug
        });
      }
    }

    const cleanedResults = assignUniqueImages(results);
    res.status(200).json({
      success: true,
      total: cleanedResults.length,
      destinations: cleanedResults
    });
  } catch (error) {
    next(error);
  }
};
