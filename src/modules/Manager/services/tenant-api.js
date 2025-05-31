import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useTenantApi = () => {
    const apiClient = useApiClient();
    
    return useMemo(() => {
        return {

        getTenant: async (tenantId) => {
            if (!tenantId) {
                console.warn('No tenant ID provided to getTenant');
                return null;
            }
            
            try {
                return await apiClient.get('/api/client/tenants/', tenantId);
            } catch (error) {
                console.error(`Error fetching tenant ${tenantId}:`, error);
                return null;
            } 
        },
        
        updateTenant: async (tenantId, tenantData) => {
            try {
                console.log('Update Data:', tenantData);
                return await apiClient.put(`/api/client/tenants/${tenantId}`, tenantData);
            } catch (error) {
                console.error('Error updating tenant:', error);
                return null;
            }
        },
    
        deleteTenant: async (tenantId) => {
            try {
            return await apiClient.delete(`/api/client/tenants/${tenantId}`);
            } catch (error) {
            console.error('Error deleting tenant:', error);
            return null;
            }
        },
        };
    }, [apiClient]);
    }
