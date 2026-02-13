import { useMemo } from 'react';
import { useApiClient } from './api-client';

/**
 * API service for Human-In-The-Loop (HITL) task operations.
 * Provides methods to query, update, complete, and reject tasks.
 */
export const useTasksApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      /**
       * Fetches a paginated list of tasks with optional filtering.
       * @param {Object} options - Query options
       * @param {number} [options.pageSize=20] - Number of items per page (max: 100)
       * @param {string} [options.pageToken] - Pagination token for continuation
       * @param {string} [options.agent] - Filter by agent name
       * @param {string} [options.participantId] - Filter by participant/user ID
       * @param {string} [options.status] - Filter by workflow execution status
       * @returns {Promise<Object>} Paginated response with tasks array
       */
      fetchTasks: async (options = {}) => {
        try {
          const { 
            pageSize = 20, 
            pageToken = null,
            agent = null,
            participantId = null,
            status = null
          } = options;

          const queryParams = {};

          if (pageSize) {
            queryParams.pageSize = pageSize;
          }

          if (pageToken) {
            queryParams.pageToken = pageToken;
          }

          if (agent) {
            queryParams.agent = agent;
          }

          if (participantId) {
            queryParams.participantId = participantId;
          }

          if (status) {
            queryParams.status = status;
          }

          return await apiClient.get('/api/client/tasks/list', queryParams);
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
          throw error;
        }
      },

      /**
       * Fetches detailed information about a specific task.
       * @param {string} workflowId - The workflow ID of the task
       * @returns {Promise<Object>} Task information
       */
      getTaskById: async (workflowId) => {
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          return await apiClient.get('/api/client/tasks', { workflowId });
        } catch (error) {
          console.error('Failed to fetch task:', error);
          throw error;
        }
      },

      /**
       * Updates the draft content of a task.
       * @param {string} workflowId - The workflow ID of the task
       * @param {string} updatedDraft - The new draft content
       * @returns {Promise<Object>} Success response
       */
      updateTaskDraft: async (workflowId, updatedDraft) => {
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          return await apiClient.put(`/api/client/tasks/draft?workflowId=${encodeURIComponent(workflowId)}`, {
            updatedDraft
          });
        } catch (error) {
          console.error('Failed to update task draft:', error);
          throw error;
        }
      },

      /**
       * Performs a generic action on a task with an optional comment.
       * All actions are treated uniformly and sent to the /action endpoint.
       * @param {string} workflowId - The workflow ID of the task
       * @param {string} action - The action to perform (e.g., 'approve', 'reject', 'hold')
       * @param {string} [comment] - Optional comment for the action
       * @returns {Promise<Object>} Success response
       */
      performAction: async (workflowId, action, comment = null) => {
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          if (!action) {
            throw new Error('Action is required');
          }

          // Send to generic /action endpoint with PascalCase properties (C# convention)
          const requestBody = {
            Action: action
          };

          // Add comment if provided
          if (comment) {
            requestBody.Comment = comment;
          }

          return await apiClient.post(
            `/api/client/tasks/action?workflowId=${encodeURIComponent(workflowId)}`,
            requestBody
          );
        } catch (error) {
          console.error('Failed to perform action:', error);
          throw error;
        }
      },

      /**
       * @deprecated Use performAction() instead. Kept for backward compatibility.
       * Marks a task as completed.
       * @param {string} workflowId - The workflow ID of the task
       * @returns {Promise<Object>} Success response
       */
      completeTask: async (workflowId) => {
        console.warn('completeTask() is deprecated. Use performAction() instead.');
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          return await apiClient.post(
            `/api/client/tasks/action?workflowId=${encodeURIComponent(workflowId)}`,
            { Action: 'approve' }
          );
        } catch (error) {
          console.error('Failed to complete task:', error);
          throw error;
        }
      },

      /**
       * @deprecated Use performAction() instead. Kept for backward compatibility.
       * Rejects a task with a reason message.
       * @param {string} workflowId - The workflow ID of the task
       * @param {string} rejectionMessage - The reason for rejection
       * @returns {Promise<Object>} Success response
       */
      rejectTask: async (workflowId, rejectionMessage) => {
        console.warn('rejectTask() is deprecated. Use performAction() instead.');
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          if (!rejectionMessage) {
            throw new Error('Rejection message is required');
          }

          return await apiClient.post(
            `/api/client/tasks/action?workflowId=${encodeURIComponent(workflowId)}`,
            { Action: 'reject', Comment: rejectionMessage }
          );
        } catch (error) {
          console.error('Failed to reject task:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
};

