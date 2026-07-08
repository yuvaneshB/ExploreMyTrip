import { getCountryDetails } from '../api/countryApi.js';

export const fetchCountryData = async (countryName) => {
  if (!countryName) {
    throw new Error('Country name is required');
  }

  try {
    const resData = await getCountryDetails(countryName);
    if (resData?.success && resData.country) {
      return resData.country;
    }
  } catch (error) {
    console.warn(`Backend country proxy failed for: ${countryName}. Using standard fallback.`);
  }

  // Stand-in fallback object in case of API failure / offline
  return {
    name: countryName,
    officialName: countryName,
    flag: '',
    capital: 'N/A',
    currency: 'USD ($)',
    languages: 'English',
    population: 'N/A',
    timeZone: 'UTC',
    region: 'Global',
    callingCode: '+1',
    mapUrl: ''
  };
};
