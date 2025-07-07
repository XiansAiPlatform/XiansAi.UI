import { useApiClient } from "./api-client";
import { useMemo } from "react";

export const useApiKeyApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => ({
    // List all API keys
    listApiKeys: async () => {
      try {
        return await apiClient.get("/api/client/apikeys");
      } catch (error) {
        console.error("Error fetching API keys:", error);
        throw error;
      }
    },

    // Create a new API key
    createApiKey: async (name) => {
      try {
        return await apiClient.post("/api/client/apikeys/create", { name });
      } catch (error) {
        console.error("Error creating API key:", error);
        throw error;
      }
    },

    // Revoke an API key
    revokeApiKey: async (id) => {
      try {
        return await apiClient.post(`/api/client/apikeys/${id}/revoke`);
      } catch (error) {
        console.error("Error revoking API key:", error);
        throw error;
      }
    },

    // Rotate an API key
    rotateApiKey: async (id) => {
      try {
        return await apiClient.post(`/api/client/apikeys/${id}/rotate`);
      } catch (error) {
        console.error("Error rotating API key:", error);
        throw error;
      }
    },
  }), [apiClient]);
};
