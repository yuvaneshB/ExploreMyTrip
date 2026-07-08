import axios from 'axios';

/**
 * Returns a flag emoji based on the ISO 3166-1 alpha-2 country code.
 */
export const getFlagEmoji = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return '📍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '📍';
  }
};

/**
 * Fetches suggestions from Geoapify Autocomplete, falling back to OSM Nominatim keylessly.
 */
export const fetchDestinationSuggestions = async (query) => {
  if (!query || query.trim().length < 2) return [];

  const apiKey = import.meta.env?.VITE_GEOAPIFY_API_KEY;

  if (apiKey) {
    try {
      const res = await axios.get('https://api.geoapify.com/v1/geocode/autocomplete', {
        params: {
          text: query,
          apiKey,
          limit: 5
        }
      });
      if (res.data?.features) {
        return res.data.features.map((feat) => {
          const props = feat.properties;
          const countryCode = props.country_code?.toUpperCase() || '';
          return {
            city: props.city || props.town || props.village || '',
            state: props.state || '',
            country: props.country || '',
            latitude: props.lat,
            longitude: props.lon,
            formattedAddress: props.formatted || '',
            flag: getFlagEmoji(countryCode),
            countryCode
          };
        });
      }
    } catch (e) {
      console.warn('Geoapify autocomplete failed. Falling back to OSM Nominatim.', e.message);
    }
  }

  // Keyless Fallback: OpenStreetMap Nominatim
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5
      }
    });



    if (res.data) {
      return res.data.map((item) => {
        const addr = item.address || {};
        const countryCode = addr.country_code?.toUpperCase() || '';
        const city = addr.city || addr.town || addr.village || addr.suburb || '';
        const state = addr.state || addr.county || '';
        const country = addr.country || '';
        return {
          city,
          state,
          country,
          latitude: Number(item.lat),
          longitude: Number(item.lon),
          formattedAddress: item.display_name || '',
          flag: getFlagEmoji(countryCode),
          countryCode
        };
      });
    }
  } catch (e) {
    console.error('OSM Nominatim autocomplete failed:', e.message);
  }

  return [];
};
