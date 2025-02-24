import { useAuth0 } from '@auth0/auth0-react';
import { handleApiError } from '../utils/errorHandler';
import { getConfig } from '../config';
import { useMemo } from 'react';
import { useSelectedOrg } from '../contexts/OrganizationContext';

const { apiBaseUrl } = getConfig();

export const useApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { selectedOrg } = useSelectedOrg();

  // Memoize the API object so it remains stable across renders
  const api = useMemo(() => {
    const getAccessToken = async () => {
      try {
        return await getAccessTokenSilently();
      } catch (error) {
        console.error('Error getting access token:', error);
        return null;
      }
    };

    const createAuthHeaders = async () => ({
      'Authorization': `Bearer ${await getAccessToken()}`,
      'Content-Type': 'application/json',
      'X-Tenant-Id': selectedOrg || '',
    });

    const getTimeRangeParams = (timeFilter) => {
      const now = new Date();
      const endTime = now.toISOString();
      let startTime;

      switch (timeFilter) {
        case '7days':
          startTime = new Date(now.setDate(now.getDate() - 7)).toISOString();
          break;
        case '30days':
          startTime = new Date(now.setDate(now.getDate() - 30)).toISOString();
          break;
        case 'all':
        default:
          startTime = null;
          break;
      }

      return { startTime, endTime };
    };

    return {
      getWorkflow: async (workflowId) => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/client/workflows/${workflowId}`, {
            headers: await createAuthHeaders()
          });
          return response.json();
        } catch (error) {
          console.error('Failed to fetch workflow:', error);
          handleApiError(error, 'Failed to fetch workflow');
        }
      },
      fetchWorkflowRuns: async (timeFilter = '7days', ownerFilter = 'all') => {
        try {
          const { startTime, endTime } = getTimeRangeParams(timeFilter);
          const queryParams = new URLSearchParams();
          
          if (startTime) {
            queryParams.append('startTime', startTime);
            queryParams.append('endTime', endTime);
          }
          if (ownerFilter === 'mine') {
            queryParams.append('owner', 'current');
          }

          const response = await fetch(`${apiBaseUrl}/api/client/workflows?${queryParams}`, {
            headers: await createAuthHeaders()
          });

          if (!response.ok) {
            let serverError = '';
            try {
              const errorData = await response.json();
              serverError = errorData.message || errorData.error || response.statusText;
            } catch {
              serverError = response.statusText;
            }

            throw new Error(JSON.stringify({
              status: response.status,
              statusText: response.statusText,
              message: serverError
            }));
          }

          return response.json();
        } catch (error) {
          console.error('Failed to fetch workflows:', error);
          handleApiError(error, 'Failed to fetch workflows');
        }
      },

      fetchActivityEvents: async (workflowId) => {
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          const response = await fetch(`${apiBaseUrl}/api/client/workflows/${workflowId}/events`, {
            headers: await createAuthHeaders()
          });

          if (!response.ok) {
            let serverError = '';
            try {
              const errorData = await response.json();
              serverError = errorData.message || errorData.error || response.statusText;
            } catch {
              serverError = response.statusText;
            }

            throw new Error(JSON.stringify({
              status: response.status,
              statusText: response.statusText,
              message: serverError
            }));
          }

          return response.json();
        } catch (error) {
          console.error('Failed to fetch workflow events:', error);
          handleApiError(error, 'Failed to fetch workflow events');
        }

      },

      executeWorkflowCancelAction: async (workflowId, force = false) => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/client/workflows/${workflowId}/cancel?force=${force}`, {
            method: 'POST',
            headers: await createAuthHeaders()
          });
          if (!response.ok) {
            throw new Error(`Failed to execute workflow cancel action (${response.status}): ${response.statusText}`);
          }
          return response.json();
        } catch (error) {
          console.error('Failed to execute workflow cancel action:', error);
          handleApiError(error, 'Failed to execute workflow cancel action');
        }
      },

      startNewWorkflow: async (workflowType, parameters) => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/client/workflows`, {
            method: 'POST',
            headers: await createAuthHeaders(),
            body: JSON.stringify({
              WorkflowType: workflowType,
              Parameters: parameters
            })
          });

          if (!response.ok) {
            let serverError = '';
            try {
              const errorData = await response.json();
              serverError = errorData.message || errorData.error || response.statusText;
            } catch {
              serverError = response.statusText;
            }
            throw new Error(JSON.stringify({
              status: response.status,
              statusText: response.statusText,
              message: serverError
            }));
          }

          return response.json();
        } catch (error) {
          console.error('Failed to start workflow:', error);
          handleApiError(error, 'Failed to start workflow');
        }
      },

      streamActivityEvents: async (workflowId, onEventReceived) => {
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          const response = await fetch(`${apiBaseUrl}/api/client/workflows/${workflowId}/events/stream`, {
            headers: await createAuthHeaders()
          });

          if (!response.ok) {
            throw new Error(`Stream connection failed: ${response.status} ${response.statusText}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = ''; // Add buffer to handle incomplete JSON

          async function readStream() {

            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                break;
              }

              // Append new data to buffer
              buffer += decoder.decode(value, { stream: true });

              // Split by newlines and process each complete line
              const lines = buffer.split('\n');
              // Keep the last potentially incomplete line in the buffer
              buffer = lines.pop() || '';

              // Process complete lines
              lines.filter(line => line.trim()).forEach(line => {
                try {
                  const event = JSON.parse(line);
                  onEventReceived(event);
                } catch (parseError) {
                  console.warn('Failed to parse event:', parseError);
                }
              });
            }

          }

          readStream();
        } catch (error) {
          console.error('Failed to establish event stream:', error);
          handleApiError(error, 'Failed to establish event stream');
        }
      },
    };
  }, [getAccessTokenSilently, selectedOrg]); // Only depends on getAccessTokenSilently

  return api;
};

