import { useCallback, createContext, use, useState, useEffect } from 'react';
import { useTenantsApi } from "../services/tenants-api";
import { useUserTenantApi } from "../services/user-tenant-api";
import { useAuth } from '../auth/AuthContext';
import { useLocation } from 'react-router-dom';
import { useRolesApi } from "../services/roles-api.js";

const TenantContext = createContext();

export const useTenant = () => use(TenantContext);

// Tenant data provider
export const TenantProvider = ({ children }) => {  
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  const tenantApi = useTenantsApi();
  const userTenantApi = useUserTenantApi();
  const rolesApi = useRolesApi();
  const { isAuthenticated, isLoading: isAuthLoading, user, getAccessTokenSilently } = useAuth();
  const location = useLocation();

  const fetchCurrentTenant = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      if (!token) {
        console.warn('No access token available for tenant fetch');
        return null;
      }

      // First try to get current tenant info from the API
      try {
        const tenantData = await tenantApi.getTenant();
        if (tenantData) {
          return tenantData;
        }
      } catch (error) {
        console.warn('Failed to get tenant from currentTenantInfo API:', error);
      }

      // Fallback: Get user's tenant information and create a basic tenant object
      try {
        const userTenants = await userTenantApi.getCurrentUserTenant(token);
        if (userTenants && userTenants.length > 0) {
          // Use the first available tenant or the selected one from localStorage
          const selectedOrg = localStorage.getItem('selectedOrganization');
          const tenantId = selectedOrg && userTenants.includes(selectedOrg) ? selectedOrg : userTenants[0];
          
          // Create a basic tenant object
          return {
            tenantId: tenantId,
            id: tenantId,
            name: tenantId,
            domain: tenantId
          };
        }
      } catch (error) {
        console.warn('Failed to get user tenants:', error);
      }

      // Final fallback: create a default tenant if nothing else works
      const fallbackTenantId = localStorage.getItem('selectedOrganization');
      console.warn(`Creating fallback tenant with ID: ${fallbackTenantId}`);
      return {
        tenantId: fallbackTenantId,
        id: fallbackTenantId,
        name: fallbackTenantId,
        domain: fallbackTenantId
      };
      
    } catch (error) {
      console.error('Error fetching tenant:', error);
      setError(error);
      return null;
    }
  }, [tenantApi, userTenantApi, getAccessTokenSilently]);

  // Fetch user roles for the current tenant
  const fetchUserRoles = useCallback(async () => {
    try {
      const roles = await rolesApi.getCurrentUserRole();
      setUserRoles(roles || []);
      return roles || [];
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setUserRoles([]);
      return [];
    }
  }, [rolesApi]);

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
        const publicPaths = ['/', '/login', '/register', '/register/join', '/register/new', '/callback'];
        if (publicPaths.includes(location.pathname)) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        
        const tenantData = await fetchCurrentTenant();
        
        if (tenantData) {
          setTenant(tenantData);
          console.log('Loaded tenant data:', tenantData);
        } else {
          console.warn('Failed to load tenant data');
        }

        // Fetch roles after tenant is available
        if (user) {
          await fetchUserRoles();
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
  }, [isAuthenticated, isAuthLoading, location.pathname, fetchCurrentTenant, fetchUserRoles, user]);

  return (
    (<TenantContext
      value={{
        tenant,
        isLoading,
        error,
        fetchTenant: fetchCurrentTenant,
        userRoles,
      }}
    >
      {children}
    </TenantContext>)
  );
};
