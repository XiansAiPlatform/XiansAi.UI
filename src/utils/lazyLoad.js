import { lazy } from 'react';

/**
 * Enhanced lazy loading utility with prefetch capability
 * 
 * @param {Function} importFunc - The import function to load the component
 * @param {Object} options - Additional options
 * @param {boolean} options.prefetch - Whether to prefetch the component on idle
 * @returns {React.LazyExoticComponent} - Lazy loaded component
 */
export const lazyLoad = (importFunc, { prefetch = false } = {}) => {
  const LazyComponent = lazy(importFunc);
  
  if (prefetch && typeof window !== 'undefined') {
    // Prefetch the component when browser is idle
    window.requestIdleCallback = window.requestIdleCallback || function(cb) {
      const start = Date.now();
      return setTimeout(function() {
        cb({
          didTimeout: false,
          timeRemaining: function() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      }, 1);
    };

    window.requestIdleCallback(() => {
      // Start preloading the component
      importFunc().catch(err => console.warn('Prefetch failed:', err));
    });
  }
  
  return LazyComponent;
};

export default lazyLoad; 
