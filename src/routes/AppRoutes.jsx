import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import lazyLoad from '../utils/lazyLoad';
import ModuleLoader from '../components/ModuleLoader';
import { getConfig } from '../config';

// Lazy load route components for code splitting
const PublicRoutes = lazyLoad(() => import('../modules/Public/PublicRoutes'), { prefetch: true });
const ManagerRoutes = lazyLoad(() => import('../modules/Manager/ManagerRoutes'));
const AgentsRoutes = lazyLoad(() => import('../modules/Agents/AgentsRoutes'));

/**
 * Custom redirect component that preserves the path after the base route
 */
const PreservePathRedirect = ({ from, to }) => {
  const location = useLocation();
  
  // Extract the part of the path after the "from" prefix
  const remainingPath = location.pathname.substring(from.length);
  
  // Construct the new path by combining the "to" prefix with the remaining path
  const newPath = `${to}${remainingPath}`;
  
  // Preserve any query parameters
  const queryParams = location.search ?? '';
  
  return <Navigate to={`${newPath}${queryParams}`} replace />;
};

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
        We'll also keep the original routes for backward compatibility
        during the transition
      */}
      {config.modules.manager && (
        <>
          {/* New /manager prefixed routes */}
          <Route path="/manager" element={<Navigate to="/manager/definitions" replace />} />
          <Route path="/manager/*" element={
            <ModuleLoader
              moduleName="manager"
              moduleComponent={<ManagerRoutes />}
              loadingMessage="Loading manager module..."
            />
          } />
          
          {/* Legacy routes for backward compatibility - preserving full paths */}
          <Route path="/runs/*" element={<PreservePathRedirect from="/runs" to="/manager/runs" />} />
          <Route path="/definitions/*" element={<PreservePathRedirect from="/definitions" to="/manager/definitions" />} />
          <Route path="/knowledge/*" element={<PreservePathRedirect from="/knowledge" to="/manager/knowledge" />} />
          <Route path="/settings/*" element={<PreservePathRedirect from="/settings" to="/manager/settings" />} />
          <Route path="/messaging/*" element={<PreservePathRedirect from="/messaging" to="/manager/messaging" />} />
          <Route path="/auditing/*" element={<PreservePathRedirect from="/auditing" to="/manager/auditing" />} />
          <Route path="/unauthorized" element={<Navigate to="/manager/unauthorized" replace />} />
          <Route path="/logout" element={<Navigate to="/manager/logout" replace />} />
        </>
      )}
      
      {/* 
        Agents routes - these already use the /agents prefix internally
        so we can use a simpler approach
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
