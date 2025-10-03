import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom hook for managing URL search parameters
 * Provides utilities to get and set URL query parameters
 */
export const useUrlParams = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Get a specific query parameter value
   * @param {string} key - The parameter key to retrieve
   * @returns {string|null} The parameter value or null if not found
   */
  const getParam = useCallback((key) => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(key);
  }, [location.search]);

  /**
   * Set or update a query parameter in the URL
   * @param {string} key - The parameter key to set
   * @param {string} value - The parameter value to set
   * @param {boolean} replace - Whether to replace the current history entry (default: true)
   */
  const setParam = useCallback((key, value, replace = true) => {
    const searchParams = new URLSearchParams(location.search);
    
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }

    const newSearch = searchParams.toString();
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;

    navigate(newUrl, { replace });
  }, [location.pathname, location.search, navigate]);

  /**
   * Set multiple query parameters at once
   * @param {Object} params - Object with key-value pairs to set
   * @param {boolean} replace - Whether to replace the current history entry (default: true)
   */
  const setParams = useCallback((params, replace = true) => {
    const searchParams = new URLSearchParams(location.search);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });

    const newSearch = searchParams.toString();
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;

    navigate(newUrl, { replace });
  }, [location.pathname, location.search, navigate]);

  /**
   * Remove a query parameter from the URL
   * @param {string} key - The parameter key to remove
   * @param {boolean} replace - Whether to replace the current history entry (default: true)
   */
  const removeParam = useCallback((key, replace = true) => {
    setParam(key, null, replace);
  }, [setParam]);

  /**
   * Get all query parameters as an object
   * @returns {Object} Object containing all query parameters
   */
  const getAllParams = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  }, [location.search]);

  return {
    getParam,
    setParam,
    setParams,
    removeParam,
    getAllParams
  };
};

