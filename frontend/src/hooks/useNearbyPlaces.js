import { useState, useEffect } from 'react';
import { fetchNearbyPlaces } from '../services/placesService.js';

export const useNearbyPlaces = (latitude, longitude, category = 'all') => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!latitude || !longitude) {
      setPlaces([]);
      return;
    }

    let isMounted = true;
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await fetchNearbyPlaces(latitude, longitude, category);
        if (isMounted) {
          setPlaces(results);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load surrounding places');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlaces();

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, category]);

  return { places, loading, error };
};

export default useNearbyPlaces;
