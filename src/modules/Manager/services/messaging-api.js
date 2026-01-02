import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useMessagingApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {

      getThreads: async (agent, page = null, pageSize = null) => {
        try {
          console.log('Fetching threads for agent:', agent);
          const params = { agent };
          if (page !== null) params.page = page;
          if (pageSize !== null) params.pageSize = pageSize;
          
          return await apiClient.get('/api/client/messaging/threads', params);
        } catch (error) {
          console.error('Error fetching threads:', error);
          throw error;
        }
      },

      getThreadMessages: async (threadId, page = null, pageSize = null, scope = undefined) => {
        try {
          const params = {};
          if (page !== null) params.page = page;
          if (pageSize !== null) params.pageSize = pageSize;
          // Only include scope parameter if explicitly provided (not undefined)
          // null means "no scope" (default messages), undefined means "don't filter"
          if (scope !== undefined) params.scope = scope;
          
          return await apiClient.get(`/api/client/messaging/threads/${threadId}/messages`, params);
        } catch (error) {
          console.error('Error fetching thread messages:', error);
          throw error;
        }
      },

      /**
       * Gets unique topics (scopes) for a thread with pagination support
       * @param {string} threadId - Thread ID to get topics for
       * @param {number} page - Page number (1-based, default: 1)
       * @param {number} pageSize - Number of topics per page (default: 50, max: 100)
       * @returns {Promise<{topics: Array<{scope: string|null, messageCount: number, lastMessageAt: string}>, pagination: {currentPage: number, pageSize: number, totalTopics: number, totalPages: number, hasMore: boolean}}>} Topics with pagination metadata
       */
      getThreadTopics: async (threadId, page = 1, pageSize = 50) => {
        try {
          const params = {};
          if (page !== null && page !== undefined) params.page = page;
          if (pageSize !== null && pageSize !== undefined) params.pageSize = pageSize;
          
          return await apiClient.get(`/api/client/messaging/threads/${threadId}/topics`, params);
        } catch (error) {
          console.error('Error fetching thread topics:', error);
          throw error;
        }
      },

      /**
       * Sends a message to an agent workflow.
       * @param {Object} options - Message options
       * @param {string} options.agent - Agent name
       * @param {string} options.workflowType - Type of workflow  
       * @param {string|null} options.workflowId - Specific workflow instance ID (null for singleton)
       * @param {string} options.participantId - ID of the message sender
       * @param {string} options.content - Message text content
       * @param {Object|null} options.metadata - Additional message data
       * @param {'chat'|'data'} options.type - Message type (defaults to 'chat')
       * @param {string|null} options.threadId - Existing thread ID (null for new thread)
       * @param {string|null} options.scope - Optional scope/topic for organizing messages
       * @returns {Promise<string>} Thread ID
       */
      sendMessage: async ({ 
        agent, 
        workflowType, 
        workflowId, 
        participantId, 
        content, 
        metadata = null, 
        type = 'chat',
        threadId = null,
        scope = null
      }) => {
        try {
          const payload = {
            agent,
            workflowType,
            workflowId,
            participantId,
            text: content,
            data: metadata
          };
          
          // Only include threadId if it exists
          if (threadId) {
            payload.threadId = threadId;
          }
          
          // Only include scope if it has a value
          if (scope) {
            payload.scope = scope;
          }
          
          // Choose endpoint based on message type
          const endpoint = type === 'data' 
            ? '/api/client/messaging/inbound/data'
            : '/api/client/messaging/inbound/chat';
          
          const response = await apiClient.post(endpoint, payload);
          console.log('[messaging-api] sendMessage response:', response);
          console.log('[messaging-api] response.value:', response.value);
          console.log('[messaging-api] response type:', typeof response);
          return response.value || response;
        } catch (error) {
          console.error('Error sending message:', error);
          throw error;
        }
      },

      deleteThread: async (threadId) => {
        try {
          return await apiClient.delete(`/api/client/messaging/threads/${threadId}`);
        } catch (error) {
          console.error('Error deleting thread:', error);
          throw error;
        }
      },

      /**
       * Streams real-time message events for a specific thread using Server-Sent Events (SSE)
       * @param {string} threadId - Thread ID to stream messages for
       * @param {Function} onEventReceived - Callback function to handle received events
       * @param {AbortSignal} abortSignal - Optional abort signal to cancel the stream
       * @returns {Promise<void>}
       */
      streamThreadMessages: async (threadId, onEventReceived, abortSignal = null) => {
        try {
          if (!threadId) {
            throw new Error('Thread ID is required');
          }

          // Use longer heartbeat interval to reduce server load and browser processing
          await apiClient.stream(
            `/api/client/messaging/threads/${threadId}/events?heartbeatSeconds=30`, 
            onEventReceived,
            {}, // queryParams
            abortSignal
          );
        } catch (error) {
          console.error('Failed to establish message stream:', error);
          throw error;
        }
      }

    };
  }, [apiClient]);
};
