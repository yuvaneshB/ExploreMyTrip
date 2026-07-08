import { useState, useEffect } from 'react';
import { fetchWeatherByCoords } from '../services/weatherService.js';

export const useWeather = (latitude, longitude) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!latitude || !longitude) {
      setWeather(null);
      return;
    }

    let isMounted = true;
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeatherByCoords(latitude, longitude);
        if (isMounted) {
          setWeather(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch weather data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude]);

  return { weather, loading, error };
};

export default useWeather;
