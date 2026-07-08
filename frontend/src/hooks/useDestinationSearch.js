import { useState, useEffect, useCallback } from 'react';
import { fetchDestinationSuggestions } from '../services/geoapifyService.js';

export const useDestinationSearch = (debounceMs = 400) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Load search history from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('destinationSearchHistory');
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Debounced query autocomplete triggers
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    let isMounted = true;
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await fetchDestinationSuggestions(query);
        if (isMounted) {
          setSuggestions(results);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load search recommendations');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounce);
    };
  }, [query, debounceMs]);

  // Select destination and save to history
  const selectDestination = useCallback((dest) => {
    setSelectedDestination(dest);
    setQuery(dest.city || dest.formattedAddress);
    setSuggestions([]);

    setSearchHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.formattedAddress?.toLowerCase() !== dest.formattedAddress?.toLowerCase()
      );
      const updated = [dest, ...filtered].slice(0, 5); // store top 5
      localStorage.setItem('destinationSearchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear search and selection state
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setSelectedDestination(null);
  }, []);

  // Clear search history list
  const clearHistory = useCallback(() => {
    localStorage.removeItem('destinationSearchHistory');
    setSearchHistory([]);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    loading,
    error,
    selectedDestination,
    setSelectedDestination,
    selectDestination,
    searchHistory,
    clearSearch,
    clearHistory
  };
};

export default useDestinationSearch;
