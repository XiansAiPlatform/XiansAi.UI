import { useApiClient } from './api-client';
import { useMemo } from 'react';

/**
 * Custom hook for document management API operations
 */
export const useDocumentsApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      /**
       * Get all document types for a specific agent
       * @param {string} agentId - Agent identifier
       * @returns {Promise<Array>} Array of document types
       */
      getDocumentTypesByAgent: async (agentId) => {
        try {
          return await apiClient.get(`/api/client/documents/agents/${agentId}/types`);
        } catch (error) {
          console.error(`Failed to fetch document types for agent ${agentId}:`, error);
          throw error;
        }
      },

      /**
       * Get documents by agent and type with pagination
       * @param {string} agentId - Agent identifier
       * @param {string} type - Document type
       * @param {number} skip - Number of records to skip (default: 0)
       * @param {number} limit - Maximum number of records to return (default: 50)
       * @param {Object} additionalParams - Additional query parameters (optional)
       * @returns {Promise<Array>} Array of documents
       */
      getDocumentsByAgentAndType: async (agentId, type, skip = 0, limit = 50, additionalParams = {}) => {
        try {
          const queryParams = { skip, limit, ...additionalParams };
          return await apiClient.get(`/api/client/documents/agents/${agentId}/types/${type}`, queryParams);
        } catch (error) {
          console.error(`Failed to fetch documents for agent ${agentId} and type ${type}:`, error);
          throw error;
        }
      },

      /**
       * Get a single document by ID
       * @param {string} id - Document identifier
       * @returns {Promise<Object>} Document object
       */
      getDocumentById: async (id) => {
        try {
          return await apiClient.get(`/api/client/documents/${id}`);
        } catch (error) {
          console.error(`Failed to fetch document ${id}:`, error);
          throw error;
        }
      },

      /**
       * Update a document
       * @param {string} id - Document identifier
       * @param {Object} data - Updated document data
       * @returns {Promise<Object>} Updated document object
       */
      updateDocument: async (id, data) => {
        try {
          return await apiClient.put(`/api/client/documents/${id}`, data);
        } catch (error) {
          console.error(`Failed to update document ${id}:`, error);
          throw error;
        }
      },

      /**
       * Delete a single document
       * @param {string} id - Document identifier
       * @returns {Promise<void>}
       */
      deleteDocument: async (id) => {
        try {
          return await apiClient.delete(`/api/client/documents/${id}`);
        } catch (error) {
          console.error(`Failed to delete document ${id}:`, error);
          throw error;
        }
      },

      /**
       * Delete multiple documents
       * @param {Array<string>} ids - Array of document identifiers
       * @returns {Promise<void>}
       */
      bulkDeleteDocuments: async (ids) => {
        try {
          return await apiClient.post('/api/client/documents/bulk-delete', ids);
        } catch (error) {
          console.error('Failed to bulk delete documents:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
};



