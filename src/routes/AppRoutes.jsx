import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from './routeConstants';
import lazyLoad from '../utils/lazyLoad';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';

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
  return (
    <Routes>
      {/* 
        Public routes - highest priority since they handle authentication
        We keep the root path and authentication-related routes here
      */}
      <Route path="/" element={
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner message="Loading..." />}>
            <PublicRoutes />
          </Suspense>
        </ErrorBoundary>
      } />
      <Route path="/login" element={
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner message="Loading..." />}>
            <PublicRoutes />
          </Suspense>
        </ErrorBoundary>
      } />
      <Route path="/register" element={
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner message="Loading..." />}>
            <PublicRoutes />
          </Suspense>
        </ErrorBoundary>
      } />
      <Route path="/callback" element={
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner message="Loading..." />}>
            <PublicRoutes />
          </Suspense>
        </ErrorBoundary>
      } />
      
      {/* 
        Manager routes - now all prefixed with /manager/ 
        We'll also keep the original routes for backward compatibility
        during the transition
      */}
      {/* New /manager prefixed routes */}
      <Route path="/manager/*" element={
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner message="Loading manager module..." />}>
            <ManagerRoutes />
          </Suspense>
        </ErrorBoundary>
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
      
      {/* 
        Agents routes - these already use the /agents prefix internally
        so we can use a simpler approach
      */}
      <Route path="/agents/*" element={
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner message="Loading agents module..." />}>
            <AgentsRoutes />
          </Suspense>
        </ErrorBoundary>
      } />
      
      {/* Fallback route for unmatched paths */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes; 
