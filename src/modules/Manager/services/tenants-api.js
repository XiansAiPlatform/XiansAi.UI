import { useApiClient } from "./api-client";
import { useMemo } from "react";

export const useTenantsApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getAllTenants: async () => {
        try {
          return await apiClient.get("/api/client/tenants");
        } catch (error) {
          console.error("Error fetching tenants:", error);
          throw error;
        }
      },

      getTenantList: async () => {
        try {
          return await apiClient.get("/api/client/tenants/list");
        } catch (error) {
          console.error("Error fetching tenants:", error);
          throw error;
        }
      },

      getTenant: async () => {
        try {
          return await apiClient.get(
            `/api/client/tenants/currentTenantInfo`
          );
        } catch (error) {
          console.error(`Error fetching tenant:`, error);
          return null;
        }
      },

      createTenant: async (tenantData) => {
        try {
          return await apiClient.post("/api/client/tenants", tenantData);
        } catch (error) {
          console.error("Error creating tenant:", error);
          throw error;
        }
      },

      updateTenant: async (tenantId, tenantData) => {
        try {
          return await apiClient.put(
            `/api/client/tenants/${tenantId}`,
            tenantData
          );
        } catch (error) {
          console.error("Error updating tenant:", error);
          return null;
        }
      },

      deleteTenant: async (tenantId) => {
        try {
          return await apiClient.delete(`/api/client/tenants/${tenantId}`);
        } catch (error) {
          console.error("Error deleting tenant:", error);
          return null;
        }
      },
    };
  }, [apiClient]);
};
