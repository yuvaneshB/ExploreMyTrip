import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook managing search input, query parameter synchronization,
 * text debouncing, search suggestions, and local history persistence.
 */
export const useSearch = (initialQueryKey = 'search') => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get(initialQueryKey) || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedTerm, setDebouncedTerm] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  }, []);

  // Sync state if URL changes directly
  useEffect(() => {
    const queryVal = searchParams.get(initialQueryKey) || '';
    setSearchTerm(queryVal);
    setDebouncedTerm(queryVal);
  }, [searchParams, initialQueryKey]);

  // Debounce the input search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 450); // 450ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Add search term to history list
  const addRecentSearch = useCallback((term) => {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();
    
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
      const updated = [cleanTerm, ...filtered].slice(0, 5); // store up to 5 items
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear search history
  const clearRecentSearches = useCallback(() => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  }, []);

  // Generate Suggestions based on matching search term and available pool
  const generateSuggestions = useCallback((input, toursPool = [], destinationsPool = []) => {
    if (!input || input.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const cleanInput = input.toLowerCase().trim();
    const suggestionsSet = new Set();

    // 1. Tour titles
    toursPool.forEach(t => {
      if (t.title.toLowerCase().includes(cleanInput)) {
        suggestionsSet.add({ type: 'Tour', text: t.title, slug: t.slug });
      }
    });

    // 2. Destinations name, cities & countries
    destinationsPool.forEach(d => {
      if (d.name.toLowerCase().includes(cleanInput)) {
        suggestionsSet.add({ type: 'Destination', text: d.name, value: d._id });
      }
      if (d.city?.name?.toLowerCase().includes(cleanInput)) {
        suggestionsSet.add({ type: 'City', text: d.city.name, value: d.city._id });
      }
      if (d.country?.name?.toLowerCase().includes(cleanInput)) {
        suggestionsSet.add({ type: 'Country', text: d.country.name, value: d.country._id });
      }
    });

    setSuggestions(Array.from(suggestionsSet).slice(0, 6)); // cap at 6 suggestions
  }, []);

  // Update URL Query params
  const updateUrlParams = useCallback((term) => {
    setSearchParams((prev) => {
      if (term) {
        prev.set(initialQueryKey, term);
      } else {
        prev.delete(initialQueryKey);
      }
      return prev;
    });
  }, [setSearchParams, initialQueryKey]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    suggestions,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    generateSuggestions,
    updateUrlParams
  };
};

export default useSearch;
