import { Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * LazyComponent - A wrapper component for lazy-loaded components with error handling
 * Uses the LoadingContext to show a top progress bar during loading instead of a full-page spinner
 * 
 * @param {Object} props - Component props
 * @param {React.LazyExoticComponent} props.component - The lazy-loaded component
 * @param {React.ReactNode} props.fallback - Custom fallback component (optional)
 * @param {Object} props.componentProps - Props to pass to the lazy-loaded component
 * @returns {React.ReactElement} - The wrapped component
 */
const LazyComponent = ({
  component: Component,
  fallback = null,
  ...componentProps
}) => {
  // Default fallback is null - the LoadingContext will show the top progress bar
  // This prevents the full-page loading popup from appearing during navigation
  const LoadingFallback = fallback || null;

  return (
    <ErrorBoundary>
      <Suspense fallback={LoadingFallback}>
        <Component {...componentProps} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyComponent; 
