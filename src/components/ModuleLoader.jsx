import { Suspense } from 'react';
import { getConfig } from '../config';
import ErrorBoundary from './ErrorBoundary';

/**
 * Component that conditionally loads a module based on configuration
 * If the module is disabled, it renders nothing (or a fallback)
 * If the module is enabled, it lazy loads it
 * Uses the LoadingContext to show a top progress bar during loading instead of a full-page spinner
 */
const ModuleLoader = ({ 
  moduleName, 
  moduleComponent, 
  fallback = null
}) => {
  const config = getConfig();
  const isModuleEnabled = config.modules?.[moduleName] ?? true;
  
  if (!isModuleEnabled) {
    return fallback;
  }
  
  return (
    <ErrorBoundary>
      {/* Use null as fallback - the LoadingContext will show the top progress bar */}
      <Suspense fallback={null}>
        {moduleComponent}
      </Suspense>
    </ErrorBoundary>
  );
};

export default ModuleLoader; 
