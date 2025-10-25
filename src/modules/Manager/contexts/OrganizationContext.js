import { createContext, use, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../auth/AuthContext'; // New import
import { useNotification } from './NotificationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {useUserTenantApi} from '../services/user-tenant-api';
import { handleApiError } from '../utils/errorHandler';
import { useUrlParams } from '../utils/useUrlParams';

const OrganizationContext = createContext();
const STORAGE_KEY = 'selectedOrganization';
const URL_PARAM_KEY = 'org';

export function OrganizationProvider({ children }) {
  const [selectedOrg, setSelectedOrg] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [isOrgLoading, setIsOrgLoading] = useState(true);
  const { getAccessTokenSilently, isAuthenticated, isLoading: isAuthLoading, user, isProcessingCallback } = useAuth();
  const { showDetailedError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const userTenantApi = useUserTenantApi();
  const { getParam, setParam } = useUrlParams();
  const prevOrgRef = useRef(null);
  
  // Sync organization from URL to state
  useEffect(() => {
    if (!selectedOrg || organizations.length === 0) return;
    
    const urlOrg = getParam(URL_PARAM_KEY);
    
    // If URL has a different org than current selection, update it
    if (urlOrg !== selectedOrg) {
      setParam(URL_PARAM_KEY, selectedOrg, true);
    }
  }, [selectedOrg, organizations, getParam, setParam]);

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

          // Priority: URL param > localStorage > first available
          const urlOrg = getParam(URL_PARAM_KEY);
          const storedOrg = localStorage.getItem(STORAGE_KEY);
          
          let orgToSelect = null;
          
          // Check URL parameter first
          if (urlOrg && orgs.includes(urlOrg)) {
            orgToSelect = urlOrg;
          } 
          // Then check localStorage
          else if (storedOrg && orgs.includes(storedOrg)) {
            orgToSelect = storedOrg;
          } 
          // Finally use first available
          else if (orgs.length > 0) {
            orgToSelect = orgs[0];
          }

          if (orgToSelect) {
            setSelectedOrg(orgToSelect);
            localStorage.setItem(STORAGE_KEY, orgToSelect);
            // Set URL parameter if not already set or different
            if (getParam(URL_PARAM_KEY) !== orgToSelect) {
              setParam(URL_PARAM_KEY, orgToSelect, true);
            }
          } else {
            // Only show organization errors for authenticated protected routes
            if (!publicPaths.includes(location.pathname) ) {
              showDetailedError('No organizations available for this user');
            }
          }
        } else if (location.pathname !== "/" && location.pathname !== "/login" && !location.pathname.startsWith('/register')) {
          navigate('/register');
        }
      } catch (error) {
        console.error('Error initializing organization:', error);
        // Only show organization errors for authenticated protected routes
        if (!publicPaths.includes(location.pathname)) {
          await handleApiError(error, 'Failed to load organization information', showDetailedError);
        }
      } finally {
        setIsOrgLoading(false);
      }
    };

    initializeOrg();
  }, [isAuthenticated, getAccessTokenSilently, showDetailedError, navigate, location.pathname, isAuthLoading, user, isProcessingCallback, userTenantApi, getParam, setParam]); // Added isAuthLoading and user

  const updateSelectedOrg = useCallback((newOrg) => {
    setSelectedOrg(newOrg);
    localStorage.setItem(STORAGE_KEY, newOrg);
    // Update URL parameter when org changes
    setParam(URL_PARAM_KEY, newOrg, true);
  }, [setParam]);

  // Clear messaging-related storage when organization changes
  useEffect(() => {
    // Only clear if the organization has actually changed (not on initial load)
    if (selectedOrg && prevOrgRef.current !== null && prevOrgRef.current !== selectedOrg) {
      try {
        // Clear messaging-related session storage
        sessionStorage.removeItem('messaging_selected_agent');
        sessionStorage.removeItem('messaging_selected_thread_id');
        sessionStorage.removeItem('messaging_selected_thread_details');
        
        // Clear messaging-related local storage
        localStorage.removeItem('sendMessageForm_metadata');
        localStorage.removeItem('sendMessageForm_showMetadata');
        
        // Clear message drafts (they start with 'message_draft_')
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('message_draft_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        console.log('Cleared messaging storage due to organization change');
      } catch (error) {
        console.warn('Failed to clear messaging storage:', error);
      }
    }
    // Update the previous org ref
    prevOrgRef.current = selectedOrg;
  }, [selectedOrg]);

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