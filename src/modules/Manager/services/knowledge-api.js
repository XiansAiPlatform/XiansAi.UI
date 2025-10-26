import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useKnowledgeApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      createKnowledge: async (knowledgeRequest) => {
        knowledgeRequest.name = knowledgeRequest.name.trim();
        try {
          return await apiClient.post('/api/client/knowledge', knowledgeRequest);
        } catch (error) {
          console.error('Error creating knowledge:', error);
          throw error;
        }
      },

      getKnowledgeByName: async (name, agent) => {
        try {
          const encodedName = encodeURIComponent(name);
          return await apiClient.get(`/api/client/knowledge/latest`, { 
            name: encodedName,
            agent: agent
          });
        } catch (error) {
          console.error('Error fetching knowledge by name:', error);
          throw error;
        }
      },

      getKnowledge: async (id) => {
        try {
          return await apiClient.get(`/api/client/knowledge/${id}`);
        } catch (error) {
          console.error('Error fetching knowledge:', error);
          throw error;
        }
      },

      getLatestKnowledge: async () => {
        try {
          return await apiClient.get('/api/client/knowledge/latest/all');
        } catch (error) {
          console.error('Error fetching latest knowledge:', error);
          throw error;
        }
      },

      deleteKnowledge: async (id) => {
        try {
          await apiClient.delete(`/api/client/knowledge/${id}`);
          return true;
        } catch (error) {
          console.error('Error deleting knowledge:', error);
          throw error;
        }
      },

      deleteAllVersions: async (name, agent) => {
        try {
          await apiClient.delete('/api/client/knowledge/all', { 
            name: name.trim(),
            agent: agent
          });
          return true;
        } catch (error) {
          console.error('Error deleting all versions:', error);
          throw error;
        }
      },

      getKnowledgeVersions: async (name, agent) => {
        try {
          //const encodedName = encodeURIComponent(name);
          return await apiClient.get(`/api/client/knowledge/versions`, { 
            name: name,
            agent: agent
          });
        } catch (error) {
          console.error('Error fetching knowledge versions:', error);
          throw error;
        }
      },
    };
  }, [apiClient]);
}; 