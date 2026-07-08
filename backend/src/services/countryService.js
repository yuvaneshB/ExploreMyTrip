import axios from 'axios';

export const fetchCountryData = async (countryName) => {
  if (!countryName) {
    throw new Error('Country name is required');
  }

  // Clean name (e.g. "Switzerland" instead of "Switzerland Alps")
  const cleanName = countryName.split(' ').find(w => w.length > 3) || countryName;
  try {
    const response = await axios.get(`https://countries.dev/name/${encodeURIComponent(cleanName)}`);
    if (response.data && response.data.length > 0) {
      const country = response.data[0];

      // Currencies format
      const currency = country.currencies?.[0] || {};
      const currencyCode = currency.code || 'N/A';
      const currencyName = currency.name || 'N/A';
      const currencySymbol = currency.symbol || '';

      // Languages format
      const languages = country.languages?.map(l => l.name).join(', ') || 'N/A';

      // Calling code format
      const callingCode = country.callingCodes?.[0] ? `+${country.callingCodes[0]}` : 'N/A';

      return {
        name: country.name || countryName,
        officialName: country.nativeName || country.name || countryName,
        flag: country.flags?.svg || country.flags?.png || '',
        capital: country.capital || 'N/A',
        currency: `${currencyName} (${currencyCode}) ${currencySymbol}`,
        languages,
        population: country.population?.toLocaleString() || 'N/A',
        timeZone: country.timezones?.[0] || 'N/A',
        region: `${country.region} (${country.subregion || ''})`,
        callingCode,
        mapUrl: `https://www.google.com/maps/place/${encodeURIComponent(country.name || countryName)}`
      };
    } else {
      throw new Error('No country data returned from API');
    }
  } catch (error) {
    console.error(`[Morgan/CountryService] countries.dev API failed for: ${cleanName}. Error:`, error.message);
  }

  // Fallback data if API fails or goes offline
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
