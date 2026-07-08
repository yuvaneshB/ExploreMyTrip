import { useState, useEffect } from 'react';
import { fetchCountryData } from '../services/countryService.js';

export const useCountries = (countryName) => {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!countryName) {
      setCountry(null);
      return;
    }

    let isMounted = true;
    const fetchCountry = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCountryData(countryName);
        if (isMounted) {
          setCountry(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch country statistics');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCountry();

    return () => {
      isMounted = false;
    };
  }, [countryName]);

  return { country, loading, error };
};

export default useCountries;
