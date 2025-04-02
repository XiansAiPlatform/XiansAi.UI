import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useInstructionsApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      createInstruction: async (instructionRequest) => {
        instructionRequest.name = instructionRequest.name.trim();
        try {
          return await apiClient.post('/api/client/instructions', instructionRequest);
        } catch (error) {
          console.error('Error creating instruction:', error);
          throw error;
        }
      },

      getInstructionByName: async (name) => {
        try {
          const encodedName = encodeURIComponent(name);
          return await apiClient.get(`/api/client/instructions/latest/${encodedName}`);
        } catch (error) {
          console.error('Error fetching instruction by name:', error);
          throw error;
        }
      },

      getInstruction: async (id) => {
        try {
          return await apiClient.get(`/api/client/instructions/${id}`);
        } catch (error) {
          console.error('Error fetching instruction:', error);
          throw error;
        }
      },

      getLatestInstructions: async () => {
        try {
          return await apiClient.get('/api/client/instructions/latest');
        } catch (error) {
          console.error('Error fetching latest instructions:', error);
          throw error;
        }
      },

      deleteInstruction: async (id) => {
        try {
          await apiClient.delete(`/api/client/instructions/${id}`);
          return true;
        } catch (error) {
          console.error('Error deleting instruction:', error);
          throw error;
        }
      },

      deleteAllVersions: async (name) => {
        try {
          await apiClient.delete('/api/client/instructions/all', { 
            "Name": name.trim() 
          });
          return true;
        } catch (error) {
          console.error('Error deleting all versions:', error);
          throw error;
        }
      },

      getInstructionVersions: async (name) => {
        try {
          const encodedName = encodeURIComponent(name);
          return await apiClient.get(`/api/client/instructions/versions`, { 
            name: encodedName 
          });
        } catch (error) {
          console.error('Error fetching instruction versions:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
};
