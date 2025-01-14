import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNotification } from './NotificationContext';
import { useNavigate, useLocation } from 'react-router-dom';

const OrganizationContext = createContext();
const STORAGE_KEY = 'selectedOrganization';

export function OrganizationProvider({ children }) {
  const [selectedOrg, setSelectedOrg] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [isOrgLoading, setIsOrgLoading] = useState(true);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const initializeOrg = async () => {
      if (!isAuthenticated) return;

      try {
        setIsOrgLoading(true);
        const token = await getAccessTokenSilently();
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const orgInfo = decodedToken['https://xians.ai/tenants'];
        const orgs = Array.isArray(orgInfo) ? orgInfo : [];
        console.log("orgs", orgs);

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
            showError('No organizations available for this user');
          }
        } else if (location.pathname !== "/" && location.pathname !== "/register") {
          navigate('/register');
        }
      } catch (error) {
        console.error('Error initializing organization:', error);
        showError('Failed to load organization information');
      } finally {
        setIsOrgLoading(false);
      }
    };

    initializeOrg();
  }, [isAuthenticated, getAccessTokenSilently, showError, navigate, location]);

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