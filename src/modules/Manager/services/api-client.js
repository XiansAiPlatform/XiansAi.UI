import { useAuth } from '../auth/AuthContext'; // New import
import { handleApiError } from '../utils/errorHandler';
import { getConfig } from '../../../config';
import { useMemo } from 'react';
import { useSelectedOrg } from '../contexts/OrganizationContext';

const { apiBaseUrl } = getConfig();

export const getTimeRangeParams = (timeFilter) => {
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

export const useApiClient = () => {
  // const { getAccessTokenSilently } = useAuth0(); // Old hook
  const { getAccessTokenSilently } = useAuth(); // New hook
  const { selectedOrg } = useSelectedOrg();

  return useMemo(() => {
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

    const request = async (endpoint, options = {}) => {
      try {
        const headers = await createAuthHeaders();
        const url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`;
        
        const response = await fetch(url, {
          headers,
          ...options,
        });

        if (!response.ok) {
          const errorResult = await handleApiError(response);
          throw errorResult;
        }

        // Check if the response is empty
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else if (options.responseType === 'blob') {
          return await response.blob();
        } else {
          return await response.text();
        }
      } catch (error) {
        console.error(`API request failed for ${endpoint}:`, error);
        throw error;
      }
    };

    return {
      get: (endpoint, queryParams = {}) => {
        const url = new URL(endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`);
        
        // Add query parameters
        Object.entries(queryParams)
          .filter(([_, value]) => value !== null && value !== undefined)
          .forEach(([key, value]) => {
            url.searchParams.append(key, value);
          });
          
        return request(url.toString(), { method: 'GET' });
      },
      
      post: (endpoint, data) => {
        return request(endpoint, {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      
      put: (endpoint, data) => {
        return request(endpoint, {
          method: 'PUT', 
          body: JSON.stringify(data)
        });
      },
      
      patch: (endpoint) => {
        return request(endpoint, {
          method: 'PATCH'
        });
      },
      
      delete: (endpoint, data) => {
        const options = {
          method: 'DELETE'
        };
        
        if (data) {
          options.body = JSON.stringify(data);
        }
        
        return request(endpoint, options);
      },
      
      getBlob: (endpoint) => {
        return request(endpoint, { 
          method: 'GET',
          responseType: 'blob'
        });
      },

      // Add stream method for event streaming
      stream: async (endpoint, onEventReceived) => {
        try {
          const headers = await createAuthHeaders();
          const url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`;
          
          const response = await fetch(url, {
            headers,
          });

          if (!response.ok) {
            const errorResult = await handleApiError(response);
            throw errorResult;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

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
          console.error(`Stream request failed for ${endpoint}:`, error);
          throw error;
        }
      }
    };
  }, [getAccessTokenSilently, selectedOrg]);
};