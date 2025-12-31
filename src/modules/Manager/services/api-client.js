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

    const createAuthHeaders = async (endpoint) => {
      const token = await getAccessToken();
      
      // Check if this is a public registration endpoint that doesn't require tenant ID
      const isPublicRegistrationEndpoint = endpoint && (
        endpoint.includes('/api/public/register/') ||
        endpoint.includes('/api/public/auth/')
      );
      
      // Ensure selectedOrg is available before making requests (except for public registration)
      if (!isPublicRegistrationEndpoint && !selectedOrg) {
        console.warn('X-Tenant-Id is not available. Organization must be selected before making API calls.');
        throw new Error('Organization not selected. Please select an organization to continue.');
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      // Only add X-Tenant-Id for non-public endpoints
      if (!isPublicRegistrationEndpoint && selectedOrg) {
        headers['X-Tenant-Id'] = selectedOrg;
      }
      
      return headers;
    };

    const request = async (endpoint, options = {}) => {
      try {
        // First, ensure we have valid auth headers
        const baseHeaders = await createAuthHeaders(endpoint);
        const url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`;
        
        // Merge headers properly - custom headers in options will override base headers
        const mergedHeaders = {
          ...baseHeaders,
          ...(options.headers || {})
        };
                
        const response = await fetch(url, {
          ...options,
          headers: mergedHeaders,
        });

        if (!response.ok) {
          // Handle 403 Forbidden error by redirecting to home page
          // This prevents users from seeing permission-related errors and provides
          // a clean user experience by redirecting them to a safe location
          if (response.status === 403) {
            console.error('Access forbidden (403). Redirecting to home page.');
            // Mark that we're redirecting due to 403 to help detect loops
            sessionStorage.setItem('from403', 'true');
            //navigate('/manager/unauthorized');
            navigate('/manager/landing');
            return; // Exit early to prevent further error handling
          }

          // Parse error response according to standard server format: { error: "message" }
          let errorMessage = 'An error occurred';
          let errorDetails = null;
          
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
              errorDetails = errorData;
            } else if (errorData && errorData.message) {
              // Handle alternative error format: { message: "error text" }
              errorMessage = errorData.message;
              errorDetails = errorData;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }
          } catch (parseError) {
            // If JSON parsing fails, try to get text response
            try {
              const textResponse = await response.text();
              if (textResponse && textResponse.trim()) {
                errorMessage = textResponse;
              }
            } catch (textError) {
              console.warn('Could not parse error response:', textError);
              // Provide more specific error messages based on status code
              switch (response.status) {
                case 400:
                  errorMessage = 'Invalid request. Please check your input and try again.';
                  break;
                case 401:
                  errorMessage = 'Your session has expired. Please log in again.';
                  break;
                case 403:
                  errorMessage = 'You do not have permission to perform this action.';
                  break;
                case 404:
                  errorMessage = 'The requested resource was not found.';
                  break;
                case 409:
                  errorMessage = 'There was a conflict with your request. The resource may already exist.';
                  break;
                case 422:
                  errorMessage = 'The request data is invalid or incomplete.';
                  break;
                case 429:
                  errorMessage = 'Too many requests. Please wait a moment and try again.';
                  break;
                case 500:
                  errorMessage = 'Internal server error. Please try again later.';
                  break;
                case 502:
                  errorMessage = 'Server is temporarily unavailable. Please try again later.';
                  break;
                case 503:
                  errorMessage = 'Service is temporarily unavailable. Please try again later.';
                  break;
                default:
                  errorMessage = `Server error (${response.status}). Please try again later.`;
              }
            }
          }
          
          if (response.status === 401) {
            console.error('Authentication error (401). Token may be invalid or expired.');
          }
          
          console.error(`API Error ${response.status}:`, errorMessage);
          const error = new Error(errorMessage);
          error.status = response.status;
          error.statusText = response.statusText;
          error.url = url;
          error.method = options.method || 'GET';
          error.details = errorDetails;
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
      
      delete: (endpoint, queryParamsOrData) => {
        // If queryParamsOrData is provided and endpoint doesn't already have query params,
        // treat it as query parameters and build the URL
        if (queryParamsOrData && typeof queryParamsOrData === 'object' && !Array.isArray(queryParamsOrData)) {
          // Check if this looks like query params (not a complex body object)
          const hasSimpleValues = Object.values(queryParamsOrData).every(
            val => typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || val === null || val === undefined
          );
          
          if (hasSimpleValues) {
            // Treat as query parameters
            const url = new URL(endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`);
            
            Object.entries(queryParamsOrData)
              .filter(([_, value]) => value !== null && value !== undefined)
              .forEach(([key, value]) => {
                url.searchParams.append(key, value);
              });
            
            return request(url.toString(), { method: 'DELETE' });
          }
        }
        
        // Otherwise treat as request body (original behavior)
        const options = {
          method: 'DELETE'
        };
        
        if (queryParamsOrData) {
          options.body = JSON.stringify(queryParamsOrData);
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
      stream: async (endpoint, onEventReceived, abortSignal = null) => {
        let reader = null;
        try {
          const headers = await createAuthHeaders(endpoint);
          const url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`;
          
          const response = await fetch(url, {
            headers,
            signal: abortSignal, // Support for aborting the request
          });

          if (!response.ok) {
            // Handle 403 Forbidden error by redirecting to home page
            // This prevents users from seeing permission-related errors and provides
            // a clean user experience by redirecting them to a safe location
            if (response.status === 403) {
              console.error('Access forbidden (403). Redirecting to home page.');
              //navigate('/manager/unauthorized');
              navigate('/manager/landing');
              return; // Exit early to prevent further error handling
            }
            
            // Parse error response according to standard server format: { error: "message" }
            let errorMessage = 'An error occurred';
            let errorDetails = null;
            
            try {
              const errorData = await response.json();
              if (errorData && errorData.error) {
                errorMessage = errorData.error;
                errorDetails = errorData;
              } else if (errorData && errorData.message) {
                // Handle alternative error format: { message: "error text" }
                errorMessage = errorData.message;
                errorDetails = errorData;
              } else if (typeof errorData === 'string') {
                errorMessage = errorData;
              }
            } catch (parseError) {
              // If JSON parsing fails, try to get text response
              try {
                const textResponse = await response.text();
                if (textResponse && textResponse.trim()) {
                  errorMessage = textResponse;
                }
              } catch (textError) {
                console.warn('Could not parse error response:', textError);
                // Provide more specific error messages based on status code
                switch (response.status) {
                  case 400:
                    errorMessage = 'Invalid request. Please check your input and try again.';
                    break;
                  case 401:
                    errorMessage = 'Your session has expired. Please log in again.';
                    break;
                  case 403:
                    errorMessage = 'You do not have permission to perform this action.';
                    break;
                  case 404:
                    errorMessage = 'The requested resource was not found.';
                    break;
                  case 409:
                    errorMessage = 'There was a conflict with your request. The resource may already exist.';
                    break;
                  case 422:
                    errorMessage = 'The request data is invalid or incomplete.';
                    break;
                  case 429:
                    errorMessage = 'Too many requests. Please wait a moment and try again.';
                    break;
                  case 500:
                    errorMessage = 'Internal server error. Please try again later.';
                    break;
                  case 502:
                    errorMessage = 'Server is temporarily unavailable. Please try again later.';
                    break;
                  case 503:
                    errorMessage = 'Service is temporarily unavailable. Please try again later.';
                    break;
                  default:
                    errorMessage = `Server error (${response.status}). Please try again later.`;
                }
              }
            }
            
            console.error(`Stream API Error ${response.status}:`, errorMessage);
            const error = new Error(errorMessage);
            error.status = response.status;
            error.statusText = response.statusText;
            error.url = url;
            error.method = 'GET';
            error.details = errorDetails;
            throw error;
          }

          reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          // Handle abort signal to properly close the reader
          if (abortSignal) {
            abortSignal.addEventListener('abort', () => {
              if (reader) {
                reader.cancel().catch(() => {}); // Gracefully close the reader
              }
            });
          }

          async function readStream() {
            try {
              while (true) {
                const { done, value } = await reader.read();

                if (done) {
                  break;
                }

                // Append new data to buffer
                buffer += decoder.decode(value, { stream: true });

                // Split by double newlines to get complete SSE events
                const events = buffer.split('\n\n');
                // Keep the last potentially incomplete event in the buffer
                buffer = events.pop() || '';

                // Process complete SSE events
                events.forEach(eventText => {
                  if (!eventText.trim()) return;
                  
                  try {
                    // Parse SSE format: "event: type\ndata: jsonData"
                    const lines = eventText.split('\n').filter(line => line.trim());
                    let eventType = 'message'; // default event type
                    let eventData = null;
                    
                    lines.forEach(line => {
                      if (line.startsWith('event:')) {
                        eventType = line.substring(6).trim();
                      } else if (line.startsWith('data:')) {
                        const dataStr = line.substring(5).trim();
                        try {
                          eventData = JSON.parse(dataStr);
                        } catch (e) {
                          eventData = dataStr; // If not JSON, use raw string
                        }
                      }
                    });
                    
                    if (eventData !== null) {
                      onEventReceived({ event: eventType, data: eventData });
                    }
                  } catch (parseError) {
                    // Reduce console spam
                    if (parseError.name !== 'AbortError') {
                      console.warn('[SSE] Failed to parse event:', parseError.message);
                    }
                  }
                });
              }
            } finally {
              // Always close the reader when done
              if (reader) {
                reader.releaseLock();
              }
            }
          }

          await readStream();
        } catch (error) {
          // Only log non-abort errors
          if (error.name !== 'AbortError') {
            console.error(`[SSE] Stream request failed for ${endpoint}:`, error);
          }
          throw error;
        } finally {
          // Ensure reader is closed
          if (reader) {
            try {
              reader.releaseLock();
            } catch (e) {
              // Reader already released
            }
          }
        }
      }
    };
  }, [getAccessTokenSilently, selectedOrg, navigate]);
};
