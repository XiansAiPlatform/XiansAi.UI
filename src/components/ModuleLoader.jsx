import { Suspense } from 'react';
import { getConfig } from '../config';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

/**
 * Component that conditionally loads a module based on configuration
 * If the module is disabled, it renders nothing (or a fallback)
 * If the module is enabled, it lazy loads it
 */
const ModuleLoader = ({ 
  moduleName, 
  moduleComponent, 
  loadingMessage = "Loading...", 
  fallback = null
}) => {
  const config = getConfig();
  const isModuleEnabled = config.modules?.[moduleName] ?? true;
  
  if (!isModuleEnabled) {
    return fallback;
  }
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
        {moduleComponent}
      </Suspense>
    </ErrorBoundary>
  );
};

export default ModuleLoader; 
