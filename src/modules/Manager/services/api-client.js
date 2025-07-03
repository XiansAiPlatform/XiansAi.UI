import { useAuth } from '../auth/AuthContext'; // New import
import { getConfig } from '../../../config';
import { useMemo } from 'react';
import { useSelectedOrg } from '../contexts/OrganizationContext';
import { useNavigate } from 'react-router-dom';

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

/**
 * Custom hook that provides an API client with authentication and error handling.
 * 
 * Features:
 * - Automatic token management and header injection
 * - 403 Forbidden error handling with automatic redirect to home page
 * - Standardized error handling for server responses in format: { error: "message" }
 * - Comprehensive error handling for various HTTP status codes
 * - Support for different response types (JSON, blob, text)
 * - Event streaming capabilities
 * 
 * Error Handling:
 * All server error responses are expected to follow the format: { error: "descriptive message" }
 * The client automatically parses this format and creates Error objects with:
 * - error.message: Contains the server's error message
 * - error.status: HTTP status code
 * - error.statusText: HTTP status text
 * 
 * @returns {Object} API client with methods: get, post, put, patch, delete, getBlob, stream
 */
export const useApiClient = () => {
  // const { getAccessTokenSilently } = useAuth0(); // Old hook
  const { getAccessTokenSilently } = useAuth(); // New hook
  const { selectedOrg } = useSelectedOrg();
  const navigate = useNavigate();

  return useMemo(() => {
    const getAccessToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        if (!token) {
          console.warn('Access token is empty or null. Auth may not be complete.');
          throw new Error('No valid access token available');
        }
        return token;
      } catch (error) {
        console.error('Error getting access token:', error);
        throw error; // Re-throw to prevent API calls without a valid token
      }
    };

    const createAuthHeaders = async () => {
      const token = await getAccessToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Tenant-Id': selectedOrg || 'default',
      };
    };

    const request = async (endpoint, options = {}) => {
      try {
        // First, ensure we have valid auth headers
        const headers = await createAuthHeaders();
        const url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`;
        
        console.log(`Making ${options.method || 'GET'} request to: ${url}`);
        
        const response = await fetch(url, {
          headers,
          ...options,
        });

        if (!response.ok) {
          // Handle 403 Forbidden error by redirecting to home page
          // This prevents users from seeing permission-related errors and provides
          // a clean user experience by redirecting them to a safe location
          if (response.status === 403) {
            console.error('Access forbidden (403). Redirecting to home page.');
            navigate('/manager/unauthorized');
            return; // Exit early to prevent further error handling
          }

          // Parse error response according to standard server format: { error: "message" }
          let errorMessage = 'An error occurred';
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            // If JSON parsing fails, try to get text response
            try {
              errorMessage = (await response.text()) || errorMessage;
            } catch (textError) {
              console.warn('Could not parse error response:', textError);
            }
          }
          
          if (response.status === 401) {
            console.error('Authentication error (401). Token may be invalid or expired.');
          }
          
          console.error(`API Error ${response.status}:`, errorMessage);
          const error = new Error(errorMessage);
          error.status = response.status;
          error.statusText = response.statusText;
          throw error;
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
            // Handle 403 Forbidden error by redirecting to home page
            // This prevents users from seeing permission-related errors and provides
            // a clean user experience by redirecting them to a safe location
            if (response.status === 403) {
              console.error('Access forbidden (403). Redirecting to home page.');
              navigate('/manager/unauthorized');
              return; // Exit early to prevent further error handling
            }
            
            // Parse error response according to standard server format: { error: "message" }
            let errorMessage = 'An error occurred';
            try {
              const errorData = await response.json();
              if (errorData && errorData.error) {
                errorMessage = errorData.error;
              }
            } catch (parseError) {
              // If JSON parsing fails, try to get text response
              try {
                errorMessage = (await response.text()) || errorMessage;
              } catch (textError) {
                console.warn('Could not parse error response:', textError);
              }
            }
            
            console.error(`Stream API Error ${response.status}:`, errorMessage);
            const error = new Error(errorMessage);
            error.status = response.status;
            error.statusText = response.statusText;
            throw error;
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
  }, [getAccessTokenSilently, selectedOrg, navigate]);
};
