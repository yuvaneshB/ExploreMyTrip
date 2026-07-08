/**
 * Helper methods for interactive mapping, coordinate extraction, and navigation directions linking.
 */

/**
 * Returns a Google Maps directions web link for the destination coordinates.
 */
export const getDirectionsLink = (latitude, longitude, name = '') => {
  if (!latitude || !longitude) return '#';
  const label = name ? `(${encodeURIComponent(name)})` : '';
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}${label}`;
};

/**
 * Returns a Google Maps search web link for attractions near a specific coordinate.
 */
export const getNearbySearchLink = (latitude, longitude, query = 'tourist attractions') => {
  if (!latitude || !longitude) return '#';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=${latitude},${longitude}`;
};

/**
 * Standardizes raw latitude/longitude points and applies default fallbacks if coordinates are malformed.
 */
export const parseCoordinates = (locObj) => {
  const defaultCoords = { latitude: 46.0207, longitude: 7.7491, name: 'Switzerland' }; // Swiss Alps fallback
  
  if (!locObj) return defaultCoords;
  
  const lat = Number(locObj.latitude || locObj.lat);
  const lng = Number(locObj.longitude || locObj.lng || locObj.lon);
  
  if (isNaN(lat) || isNaN(lng)) return defaultCoords;

  return {
    latitude: lat,
    longitude: lng,
    name: locObj.name || 'Location Point'
  };
};
