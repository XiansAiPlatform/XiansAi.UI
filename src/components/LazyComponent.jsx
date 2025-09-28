import { Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import EnhancedLoadingSpinner from './EnhancedLoadingSpinner';

/**
 * LazyComponent - A wrapper component for lazy-loaded components with error handling
 * 
 * @param {Object} props - Component props
 * @param {React.LazyExoticComponent} props.component - The lazy-loaded component
 * @param {string} props.loadingMessage - Message to display while loading
 * @param {React.ReactNode} props.fallback - Custom fallback component (optional)
 * @param {number} props.refreshTimeout - Time in ms before showing refresh link (default: 10000)
 * @param {Object} props.componentProps - Props to pass to the lazy-loaded component
 * @returns {React.ReactElement} - The wrapped component
 */
const LazyComponent = ({
  component: Component,
  loadingMessage = 'Loading...',
  fallback = null,
  refreshTimeout = 10000,
  ...componentProps
}) => {
  const LoadingFallback = fallback || (
    <EnhancedLoadingSpinner 
      message={loadingMessage} 
      refreshTimeout={refreshTimeout} 
    />
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={LoadingFallback}>
        <Component {...componentProps} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyComponent; 
