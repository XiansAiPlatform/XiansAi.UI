import { useState, useCallback } from 'react';
import React from 'react';

/**
 * Standardized loading hook that provides consistent loading state management
 * and error handling across the Manager module. Similar to how handleApiError
 * standardizes error handling, this hook standardizes loading patterns.
 * 
 * @param {boolean} initialState - Initial loading state (default: false)
 * @returns {object} Loading state and utilities
 */
export const useStandardLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);

  /**
   * Wraps an async function with loading state management
   * Automatically sets loading to true before execution and false after completion
   * 
   * @param {Function} asyncFn - Async function to execute
   * @param {Function} errorHandler - Optional error handler (e.g., handleApiError)
   * @returns {Promise} Result of the async function
   */
  const withLoading = useCallback(async (asyncFn, errorHandler = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err);
      if (errorHandler) {
        await errorHandler(err);
      }
      throw err; // Re-throw to allow component-level handling if needed
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Manually clear any error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset both loading and error states
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    setIsLoading,
    withLoading,
    clearError,
    reset
  };
};

/**
 * Specialized hook for pagination/infinite scroll loading states
 * Manages both initial loading and "load more" states
 * 
 * @param {boolean} initialState - Initial loading state (default: false)
 * @returns {object} Pagination loading state and utilities
 */
export const usePaginationLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Wraps initial data fetch with loading state
   */
  const withInitialLoading = useCallback(async (asyncFn, errorHandler = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err);
      if (errorHandler) {
        await errorHandler(err);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Wraps pagination/load more operations with loading state
   */
  const withLoadMoreLoading = useCallback(async (asyncFn, errorHandler = null) => {
    setIsLoadingMore(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err);
      if (errorHandler) {
        await errorHandler(err);
      }
      throw err;
    } finally {
      setIsLoadingMore(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
  }, []);

  return {
    isLoading,
    isLoadingMore,
    error,
    setIsLoading,
    setIsLoadingMore,
    withInitialLoading,
    withLoadMoreLoading,
    clearError,
    reset
  };
};

/**
 * Specialized hook for form submission loading states
 * Provides semantic naming for form operations
 * 
 * @returns {object} Form loading state and utilities
 */
export const useFormLoading = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const withSubmitting = useCallback(async (asyncFn, errorHandler = null) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err);
      if (errorHandler) {
        await errorHandler(err);
      }
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const withDeleting = useCallback(async (asyncFn, errorHandler = null) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err);
      if (errorHandler) {
        await errorHandler(err);
      }
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsDeleting(false);
    setError(null);
  }, []);

  return {
    isSubmitting,
    isDeleting,
    error,
    setIsSubmitting,
    setIsDeleting,
    withSubmitting,
    withDeleting,
    clearError,
    reset
  };
};

/**
 * Enhanced loading state hook with customizable ContentLoader rendering
 * @param {boolean} initialState - Initial loading state (default: false)
 * @param {object} loaderConfig - Configuration for the ContentLoader component
 * @returns {object} { isLoading, setIsLoading, withLoading, renderLoader, clearError, reset }
 */
export const useContentLoading = (initialState = false, loaderConfig = {}) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const withLoading = useCallback(async (asyncFn, errorHandler = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err);
      if (errorHandler) {
        await errorHandler(err);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderLoader = useCallback(() => {
    if (!isLoading) return null;
    
    // Lazy import to avoid circular dependencies
    const { ContentLoader } = require('../Components/Common/StandardLoaders');
    
    const { 
      size = 'large',
      message,
      direction = 'column',
      sx = {},
      containerProps = {},
      ...props 
    } = loaderConfig;

    return React.createElement(ContentLoader, {
      size,
      message,
      direction,
      sx,
      containerProps,
      ...props
    });
  }, [isLoading, loaderConfig]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    setIsLoading,
    withLoading,
    renderLoader,
    clearError,
    reset
  };
}; 
