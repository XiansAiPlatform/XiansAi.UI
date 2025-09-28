import { createContext, use, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext'; // New import
import { useNotification } from './NotificationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {useUserTenantApi} from '../services/user-tenant-api';

const OrganizationContext = createContext();
const STORAGE_KEY = 'selectedOrganization';

export function OrganizationProvider({ children }) {
  const [selectedOrg, setSelectedOrg] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [isOrgLoading, setIsOrgLoading] = useState(true);
  const { getAccessTokenSilently, isAuthenticated, isLoading: isAuthLoading, user, isProcessingCallback } = useAuth();
  const { showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const userTenantApi = useUserTenantApi();
  
  useEffect(() => {
    const initializeOrg = async () => {
      const publicPaths = ['/', '/login', '/register', '/register/join', '/register/new', '/callback'];
      
      // Wait for auth loading to complete before checking isAuthenticated
      if (isAuthLoading) {
        setIsOrgLoading(true); // Keep org loading true while auth is loading
        return;
      }
      
      // Don't initialize org if we're processing a callback
      if (isProcessingCallback) {
        setIsOrgLoading(true);
        return;
      }
      
      // Skip org initialization for public paths entirely, regardless of auth status
      if (publicPaths.includes(location.pathname) || location.pathname.startsWith('/register')) {
        setIsOrgLoading(false);
        return;
      }
      
      // Only proceed with org initialization if user is authenticated and not on public paths
      if (!isAuthenticated) {
        setIsOrgLoading(false);
        return;
      }

      try {
        setIsOrgLoading(true);
        const token = await getAccessTokenSilently();
        if (!token) {
            // This case can happen if getAccessTokenSilently fails silently or user is not fully authenticated.
            console.warn('OrganizationContext: No token available for org initialization.');
            // Depending on app logic, you might want to show an error or wait.
            // If ProtectedRoute handles unauthenticated state by redirecting, this might be okay.
            setIsOrgLoading(false); 
            return;
        }

        var orgs = await userTenantApi.getCurrentUserTenant(token);


        if (orgs.length > 0) {
          setOrganizations(orgs);

          // Get stored org or use first available
          const storedOrg = localStorage.getItem(STORAGE_KEY);
          if (storedOrg && orgs.includes(storedOrg)) {
            setSelectedOrg(storedOrg);
          } else if (orgs.length > 0) {
            setSelectedOrg(orgs[0]);
            localStorage.setItem(STORAGE_KEY, orgs[0]);
          } else {
        // Only show organization errors for authenticated protected routes
        if (!publicPaths.includes(location.pathname) ) {
          showError('No organizations available for this user');
        }
          }
        } else if (location.pathname !== "/" && location.pathname !== "/login" && !location.pathname.startsWith('/register')) {
          navigate('/register');
        }
      } catch (error) {
        console.error('Error initializing organization:', error);
        // Only show organization errors for authenticated protected routes
        if (!publicPaths.includes(location.pathname) ) {
          showError('Failed to load organization information');
        }
      } finally {
        setIsOrgLoading(false);
      }
    };

    initializeOrg();
  }, [isAuthenticated, getAccessTokenSilently, showError, navigate, location, isAuthLoading, user, isProcessingCallback, userTenantApi]); // Added isAuthLoading and user

  const updateSelectedOrg = (newOrg) => {
    setSelectedOrg(newOrg);
    localStorage.setItem(STORAGE_KEY, newOrg);
  };

  return (
    (<OrganizationContext
      value={{
        selectedOrg,
        setSelectedOrg: updateSelectedOrg,
        organizations,
        isOrgLoading
      }}
    >
      {children}
    </OrganizationContext>)
  );
}

export function useSelectedOrg() {
  const context = use(OrganizationContext);
  if (!context) {
    throw new Error('useSelectedOrg must be used within an OrganizationProvider');
  }
  return context;
} 