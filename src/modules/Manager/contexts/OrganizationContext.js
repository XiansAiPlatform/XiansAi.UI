import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useAuth0 } from '@auth0/auth0-react'; // Old import
import { useAuth } from '../../../auth/AuthContext'; // New import
import { useNotification } from './NotificationContext';
import { useNavigate, useLocation } from 'react-router-dom';

const OrganizationContext = createContext();
const STORAGE_KEY = 'selectedOrganization';

export function OrganizationProvider({ children }) {
  const [selectedOrg, setSelectedOrg] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [isOrgLoading, setIsOrgLoading] = useState(true);
  // const { getAccessTokenSilently, isAuthenticated } = useAuth0(); // Old hook
  const { getAccessTokenSilently, isAuthenticated, isLoading: isAuthLoading, user } = useAuth(); // New hook, added isAuthLoading and user
  const { showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const initializeOrg = async () => {
      const publicPaths = ['/', '/login', '/register', '/callback']; // Added /callback
      // Wait for auth loading to complete before checking isAuthenticated
      if (isAuthLoading) {
        setIsOrgLoading(true); // Keep org loading true while auth is loading
        return;
      }
      if (!isAuthenticated || publicPaths.includes(location.pathname)) {
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

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        // The claim for tenant/organization info might differ between Auth0 and Entra ID.
        // This needs to be generalized or handled based on the provider.
        // For now, assume Auth0-like custom claim path. This will need adjustment for Entra ID.
        // Consider moving tenant/org extraction into the Auth service or a helper.
        const orgInfoPath = getConfig().authProvider === 'entraId' ? 'roles' : 'https://xians.ai/tenants'; 
        // For Entra ID, 'roles' might contain app roles assigned to the user, or groups.
        // Or you might use a custom claim like 'tid' for tenant ID directly if configured.
        // This is a placeholder and likely needs more robust handling for Entra ID.
        let orgInfo = decodedToken[orgInfoPath];
        
        // If Entra ID and using 'roles', it's an array of role names. 
        // If it's 'tid', it's a single string tenant ID.
        // This logic needs to be robust based on how you configure Entra ID claims.
        if (getConfig().authProvider === 'entraId') {
            // Example: if roles are used and they represent orgs, or if a specific claim holds orgs
            // This is highly dependent on your Entra ID App Registration claims configuration.
            // For simplicity, let's assume for now that 'roles' claim can be used or a specific custom claim.
            // If `decodedToken.tid` is the tenant ID, you might use that or fetch orgs based on it.
            // This part is a BIG TODO and needs to be adapted to your actual Entra ID setup.
            // For now, if it's entraId and orgInfo is not found via the direct path, try common claims or default.
             if (!orgInfo && decodedToken.tid) { // Example: use tenant ID as a single org identifier
                 orgInfo = [decodedToken.tid]; 
             } else if (Array.isArray(orgInfo)){
                 // If roles or a custom claim gave an array, use it.
             } else {
                 orgInfo = []; // Default to empty if no clear mapping.
             }
        }

        const orgs = Array.isArray(orgInfo) ? orgInfo : (orgInfo ? [orgInfo] : []);

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
            if (!publicPaths.includes(location.pathname)) {
              showError('No organizations available for this user');
            }
          }
        } else if (location.pathname !== "/" && location.pathname !== "/register" && location.pathname !== "/login") {
          navigate('/register');
        }
      } catch (error) {
        console.error('Error initializing organization:', error);
        // Only show organization errors for authenticated protected routes
        if (!publicPaths.includes(location.pathname)) {
          showError('Failed to load organization information');
        }
      } finally {
        setIsOrgLoading(false);
      }
    };

    initializeOrg();
  }, [isAuthenticated, getAccessTokenSilently, showError, navigate, location, isAuthLoading, user]); // Added isAuthLoading and user

  const updateSelectedOrg = (newOrg) => {
    setSelectedOrg(newOrg);
    localStorage.setItem(STORAGE_KEY, newOrg);
  };

  return (
    <OrganizationContext.Provider
      value={{
        selectedOrg,
        setSelectedOrg: updateSelectedOrg,
        organizations,
        isOrgLoading
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useSelectedOrg() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useSelectedOrg must be used within an OrganizationProvider');
  }
  return context;
} 