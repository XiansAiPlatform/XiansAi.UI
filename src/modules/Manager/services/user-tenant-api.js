import { useMemo } from 'react';
import { getConfig } from '../../../config';

export const useUserTenantApi = () => {
  return useMemo(() => {
    return {
      getCurrentUserTenant: async (token) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants/current`;
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const json = await response.json();
          return json.data;
        } catch (error) {
          console.log('Failed to fetch user tenants:', error);
          throw error;
        }
      },
    };
  }, []);
};