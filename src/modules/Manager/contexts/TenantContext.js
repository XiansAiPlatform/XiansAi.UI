import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTenantApi } from "../services/tenant-api";
import { useAuth } from '../auth/AuthContext';
import { useLocation } from 'react-router-dom';

const TenantContext = createContext();

export const useTenant = () => useContext(TenantContext);

// Tenant data provider
export const TenantProvider = ({ children }) => {  
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const tenantApi = useTenantApi();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();

  const fetchTenant = React.useCallback(async (tenantId) => {
    try {
      // Make sure tenantId is properly provided before making the API call
      if (!tenantId) {
        console.warn('No tenant ID provided to fetchTenant');
        return null;
      }

      const data = await tenantApi.getTenant(tenantId);
      
      if (data) {
        return data;
      } else {
        console.warn(`No data returned for tenant ${tenantId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching tenant with ${tenantId}:`, error);
      setError(error);
      return null;
    }
  }, [tenantApi]);


  useEffect(() => {
    const loadTenantData = async () => {
      try {
        // Skip if auth is still loading
        if (isAuthLoading) {
          return;
        }

        // Skip if user is not authenticated (except for public routes)
        if (!isAuthenticated) {
          console.log('User not authenticated, skipping tenant data load');
          setIsLoading(false);
          return;
        }

        // Skip tenant loading for public routes
        const publicPaths = ['/', '/login', '/register', '/callback'];
        if (publicPaths.includes(location.pathname)) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        
        // Get the tenant ID 
        let tenantId = null;
        
        // Fallback to localStorage if not in user profile
        tenantId = localStorage.getItem('selectedOrganization');
              
        const tenantData = await fetchTenant(tenantId);
        
        if (tenantData) {
          setTenant(tenantData);
        } else {
          console.warn('Tenant data fetch returned null or undefined');
        }
      } catch (err) {
        console.error('Error loading tenant data:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay before loading tenant data to ensure auth context is ready
    const timer = setTimeout(() => {
      loadTenantData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isAuthLoading, location.pathname, fetchTenant]);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        isLoading,
        error,
        fetchTenant
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};
