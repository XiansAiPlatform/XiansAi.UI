import { Routes, Route } from 'react-router-dom';
import lazyLoad from '../utils/lazyLoad';
import ModuleLoader from '../components/ModuleLoader';
import { getConfig } from '../config';

// Lazy load route components for code splitting
const PublicRoutes = lazyLoad(() => import('../modules/Public/PublicRoutes'), { prefetch: true });
const ManagerRoutes = lazyLoad(() => import('../modules/Manager/ManagerRoutes'));
const AgentsRoutes = lazyLoad(() => import('../modules/Agents/AgentsRoutes'));

/**
 * Central routing component that organizes all application routes
 * This provides proper hierarchy and priority for routes
 */
const AppRoutes = () => {
  const config = getConfig();
  
  return (
    <Routes>
      {/* 
        Public routes - highest priority since they handle authentication
        Use a wildcard route to allow PublicRoutes to handle its own paths
      */}
      {config.modules.public && (
        <Route path="/*" element={
          <ModuleLoader
            moduleName="public"
            moduleComponent={<PublicRoutes />}
            loadingMessage="Loading..."
          />
        } />
      )}
      
      {/* 
        Manager routes - now all prefixed with /manager/ 
      */}
      {config.modules.manager && (
        <>
          {/* New /manager prefixed routes */}
          <Route path="/manager/*" element={
            <ModuleLoader
              moduleName="manager"
              moduleComponent={<ManagerRoutes />}
              loadingMessage="Loading manager module..."
            />
          } />
        </>
      )}
      
      {/* 
        Agents routes
      */}
      {config.modules.agents && (
        <Route path="/agents/*" element={
          <ModuleLoader
            moduleName="agents"
            moduleComponent={<AgentsRoutes />}
            loadingMessage="Loading agents module..."
          />
        } />
      )}
      
      {/* Fallback route if no other routes match */}
      <Route path="*" element={
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>404 - Not Found</h1>
          <p>The requested page could not be found.</p>
          {config.modules.public && <p><a href="/">Return to home</a></p>}
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes; 
