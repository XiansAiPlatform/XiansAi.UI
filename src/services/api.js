import { useAuth0 } from '@auth0/auth0-react';
import { handleApiError } from '../utils/errorHandler';

const API_BASE_URL = 'http://localhost:5257';

// Create a custom hook to handle auth
export const useApi = () => {
  const { getAccessTokenSilently } = useAuth0();

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
  });

  // Return API methods that use the token
  return {
    fetchWorkflowRuns : async () => {
      try {
        console.log('fetchWorkflowRuns called');
        const response = await fetch(`${API_BASE_URL}/api/client/workflows`, {
          headers: await createAuthHeaders()
        });
        
        if (!response.ok) {
          // Get the error message from the server if available
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
        throw new Error(handleApiError(error, 'Failed to fetch workflows').description);
      }
    },

    fetchActivityEvents : async (workflowId) => {
      try {
        if (!workflowId) {
          throw new Error('Workflow ID is required');
        }

        const response = await fetch(`${API_BASE_URL}/api/client/workflows/${workflowId}/events`, {
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
        throw new Error(handleApiError(error, 'Failed to fetch workflow events').description);
      }
    },

    executeWorkflowCancelAction : async (workflowId, force = false) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/client/workflows/${workflowId}/cancel?force=${force}`, { 
          method: 'POST', 
          headers: await createAuthHeaders() 
        });
        if (!response.ok) {
          throw new Error(`Failed to execute workflow cancel action (${response.status}): ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        throw new Error(`Error: ${error.message}`);
      }
    },

    startNewWorkflow: async (workflowType, parameters) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/client/workflows`, {
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
        throw new Error(handleApiError(error, 'Failed to start workflow').description);
      }
    },

    generateCertificate: async (name, password) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/client/certificates/generate`, {
          method: 'POST',
          headers: await createAuthHeaders(),
          body: JSON.stringify({
            Name: name,
            Password: password
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

        return response.blob();
      } catch (error) {
        throw new Error(handleApiError(error, 'Failed to generate certificate').description);
      }
    },

    streamWorkflowEvents: async (workflowId, onEventReceived) => {
      try {
        if (!workflowId) {
          throw new Error('Workflow ID is required');
        }

        const response = await fetch(`${API_BASE_URL}/api/client/workflows/${workflowId}/stream-events`, {
          headers: await createAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Stream connection failed: ${response.status} ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        async function readStream() {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                break;
              }
              
              const decodedValue = decoder.decode(value);
              const events = decodedValue.split('\n')
                .filter(line => line.trim())
                .map(line => JSON.parse(line));
                
              events.forEach(event => onEventReceived(event));
            }
          } catch (error) {
            throw new Error(handleApiError(error, 'Stream reading failed').description);
          }
        }

        return readStream();
      } catch (error) {
        throw new Error(handleApiError(error, 'Failed to establish event stream').description);
      }
    },
  };

};

