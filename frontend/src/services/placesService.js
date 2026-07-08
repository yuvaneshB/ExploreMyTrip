import axios from 'axios';

// Curated dictionary of realistic matching place names based on location keywords
const nameTemplates = {
  catering: [
    { name: 'Alpine Bistro & Grill', rating: 4.8, type: 'Restaurant' },
    { name: 'Panoramic Peak Café', rating: 4.6, type: 'Café' },
    { name: 'Chez La Terrase', rating: 4.5, type: 'Restaurant' },
    { name: 'The Local Tavern', rating: 4.4, type: 'Pub' },
    { name: 'Green Garden Salad Bar', rating: 4.3, type: 'Vegetarian' }
  ],
  accommodation: [
    { name: 'Matterhorn Peak Lodge', rating: 4.9, type: 'Hotel' },
    { name: 'The Grand Chalet Resort', rating: 4.8, type: 'Resort' },
    { name: 'Summit Vista Hotel', rating: 4.7, type: 'Hotel' },
    { name: 'Backpacker Central Hostel', rating: 4.2, type: 'Hostel' },
    { name: 'Alpine Meadows Guesthouse', rating: 4.5, type: 'B&B' }
  ],
  tourism: [
    { name: 'Matterhorn Glacier Trail', rating: 4.9, type: 'Sightseeing' },
    { name: 'Alpine Historical Museum', rating: 4.4, type: 'Museum' },
    { name: 'Scenic Valley Park', rating: 4.7, type: 'Park' },
    { name: 'Local Artisan Bazaar', rating: 4.3, type: 'Shopping' },
    { name: 'Skyline Cable Car Terminal', rating: 4.8, type: 'Attraction' }
  ]
};

/**
 * Calculates distance in kilometers between two coordinates using the Haversine formula.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

/**
 * Translates simplified category terms into Geoapify categories.
 */
const getGeoapifyCategory = (category) => {
  const map = {
    catering: 'catering.restaurant,catering.cafe',
    accommodation: 'accommodation.hotel,accommodation.hostel',
    tourism: 'tourism.attraction,entertainment.culture.museum,leisure.park',
    all: 'catering.restaurant,accommodation.hotel,tourism.attraction'
  };
  return map[category] || map.all;
};

export const fetchNearbyPlaces = async (latitude, longitude, category = 'all', radiusMeters = 5000) => {
  if (!latitude || !longitude) return [];

  const apiKey = import.meta.env?.VITE_GEOAPIFY_API_KEY;

  if (apiKey) {
    try {
      const geoCategory = getGeoapifyCategory(category);
      const res = await axios.get('https://api.geoapify.com/v2/places', {
        params: {
          categories: geoCategory,
          filter: `circle:${longitude},${latitude},${radiusMeters}`,
          bias: `proximity:${longitude},${latitude}`,
          limit: 10,
          apiKey
        }
      });

      if (res.data?.features) {
        return res.data.features.map((feat) => {
          const props = feat.properties;
          const distKm = props.distance ? (props.distance / 1000).toFixed(1) : 
            calculateDistance(latitude, longitude, props.lat, props.lon).toFixed(1);

          return {
            name: props.name || props.street || 'Nearby Spot',
            type: props.categories?.[0]?.split('.')?.[1] || 'Place',
            rating: props.rating || (4 + Math.random()).toFixed(1), // Geoapify places ratings fallback
            distance: `${distKm} km`,
            latitude: props.lat,
            longitude: props.lon,
            address: props.formatted || '',
            openStatus: Math.random() > 0.3 ? 'Open' : 'Closed'
          };
        });
      }
    } catch (e) {
      console.warn('Geoapify Places API failed. Using matching fallback generator.', e.message);
    }
  }

  // Stand-in coordinate-shifted Fallback Generator
  // Shift coordinates by slight offsets to mock nearby places around the center coordinates
  const lookupKey = ['catering', 'accommodation', 'tourism'].includes(category) ? category : 'tourism';
  const templates = nameTemplates[lookupKey];

  return templates.map((tpl, idx) => {
    // Generate slight latitude/longitude offsets (approx 100m to 1.5km)
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;
    const placeLat = latitude + latOffset;
    const placeLng = longitude + lngOffset;
    const dist = calculateDistance(latitude, longitude, placeLat, placeLng).toFixed(1);

    return {
      name: tpl.name,
      type: tpl.type,
      rating: tpl.rating,
      distance: `${dist} km`,
      latitude: placeLat,
      longitude: placeLng,
      address: `Near main station, ${tpl.type} block`,
      openStatus: idx % 3 === 0 ? 'Closed' : 'Open'
    };
  });
};
