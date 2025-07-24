import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useRolesApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getCurrentUserRole: async () => {
        try {
          return await apiClient.get('/api/roles/current');
        } catch (error) {
          console.log('Failed to fetch Flow Server API key:', error);
          throw error;
        }
      },
       getTenantAdmins: async (tenantId) => {
        try {
          return await apiClient.get(`/api/roles/tenant/${tenantId}/admins`);
        } catch (error) {
          console.log('Failed to fetch tenant admins:', error);
          throw error;
        }
      },
      getRoles: async () => {
        try {
          return await apiClient.get('/api/roles');
        } catch (error) {
          console.log('Failed to fetch roles:', error);
          throw error;
        }
      },
      deleteRole: async (roleId) => {
        try {
          return await apiClient.delete(`/api/roles/${roleId}`);
        } catch (error) {
          console.log('Failed to delete role:', error);
          throw error;
        }
      },
      addTenantAdmin: async (tenantId, userId) => {
        try {
          return await apiClient.post(`/api/roles/tenant/${tenantId}/admins`, { userId });
        } catch (error) {
          console.log('Failed to add tenant admin:', error);
          throw error;
        }
      },
      removeTenantAdmin: async (tenantId, userId) => {
        try {
          return await apiClient.delete(`/api/roles/tenant/${tenantId}/admins/${userId}`);
        } catch (error) {
          console.log('Failed to remove tenant admin:', error);
          throw error;
        }
      },
    };
  }, [apiClient]);
}; 