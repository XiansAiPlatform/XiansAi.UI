# API Integration Patterns Guide

This document outlines the recommended patterns for implementing API calls in our frontend application.

## Architecture Overview

The application follows a three-layered architecture for API integration:

1. **API Service Layer** (`src/services/`) - Contains API client implementations
2. **Component Layer** (`src/components/`) - React components that consume the API services
3. **Context Layer** (`src/contexts/`) - Manages global state and shared functionality

## Implementation Patterns

### 1. API Service Layer

API services should be implemented as custom hooks that encapsulate all API-related logic for a specific domain entity.

#### Creating API Services

Our application uses a centralized API client that handles common concerns like authentication, error handling, and request formatting. This approach simplifies individual API service implementations.

1. **Basic Service Structure**:

```javascript
// src/services/entity-api.js
import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useEntityApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      // Get all entities
      getAll: async (params = {}) => {
        try {
          return await apiClient.get('/api/entities', { params });
        } catch (error) {
          console.error('Error fetching entities:', error);
          throw error;
        }
      },
      
      // Get entity by ID
      getById: async (id) => {
        try {
          return await apiClient.get(`/api/entities/${id}`);
        } catch (error) {
          console.error(`Error fetching entity ${id}:`, error);
          throw error;
        }
      },
      
      // Create entity
      create: async (data) => {
        try {
          return await apiClient.post('/api/entities', data);
        } catch (error) {
          console.error('Error creating entity:', error);
          throw error;
        }
      },
      
      // Update entity
      update: async (id, data) => {
        try {
          return await apiClient.put(`/api/entities/${id}`, data);
        } catch (error) {
          console.error(`Error updating entity ${id}:`, error);
          throw error;
        }
      },
      
      // Delete entity
      delete: async (id) => {
        try {
          await apiClient.delete(`/api/entities/${id}`);
          return true;
        } catch (error) {
          console.error(`Error deleting entity ${id}:`, error);
          throw error;
        }
      }
    };
  }, [apiClient]);
};
```

1. **Real-world Example**:

```javascript
// src/services/activities-api.js
import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useActivitiesApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getWorkflowActivity: async (workflowId, activityId) => {
        try {
          return await apiClient.get(`/api/client/workflows/${workflowId}/activities/${activityId}`);
        } catch (error) {
          console.error('Error fetching workflow activity:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
};
```

#### Using API Services in Components

```javascript
import { useEffect, useState } from 'react';
import { useEntityApi } from '../services/entity-api';

const EntityList = () => {
  const entityApi = useEntityApi();
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch entities
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await entityApi.getAll();
        setEntities(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch entities');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntities();
  }, [entityApi]);
  
  // Component rendering...
};
```

#### Example with React Query

```javascript
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useEntityApi } from '../services/entity-api';

const EntityList = () => {
  const entityApi = useEntityApi();
  const queryClient = useQueryClient();
  
  // Query for fetching entities
  const { 
    data: entities = [], 
    isLoading, 
    error 
  } = useQuery('entities', entityApi.getAll);
  
  // Mutation for creating entity
  const createMutation = useMutation(entityApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('entities');
    }
  });
  
  // Component rendering...
};
```

#### Key Patterns

- Use a centralized `apiClient` for consistent API interactions
- Use `useMemo` to memoize API methods, preventing recreations on component renders
- Implement clean try/catch blocks in each method for error handling
- Use TypeScript interfaces for type safety when applicable
- Keep API services focused on a specific domain entity or feature
- Return a structured object of API methods

### 2. Component Implementation

Components should follow these patterns when implementing API calls:

```javascript
const EntityComponent = () => {
  // 1. Initialize API hooks
  const entityApi = useEntityApi();
  
  // 2. Manage component state
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 3. Implement data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await entityApi.getAll();
        setData(result);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [entityApi]);
}
```

#### Best Practices

- Separate data fetching from UI rendering
- Implement loading and error states
- Use appropriate dependency arrays in hooks
- Handle component unmounting
- Implement data refresh strategies

### 3. Error Handling

The application implements standardized error handling that works with the server's consistent error response format:

#### Server Error Response Format

All error responses from the server follow this format:
```json
{
  "error": "Descriptive error message"
}
```

#### Client Error Handling

The `useApiClient` hook automatically handles this format:

```javascript
// The API client automatically parses server errors
const apiClient = useApiClient();

try {
  const data = await apiClient.get('/api/endpoint');
  return data;
} catch (error) {
  // error.message contains the server's error message
  console.error('API Error:', error.message);
  
  // error.status contains the HTTP status code
  console.error('Status:', error.status);
  
  // Re-throw for component-level handling
  throw error;
}
```

#### Component Error Handling

Components should use the `handleApiError` utility for consistent error presentation:

```javascript
import { handleApiError } from '../utils/errorHandler';
import { useNotification } from '../contexts/NotificationContext';

const MyComponent = () => {
  const { showError } = useNotification();
  const apiClient = useApiClient();

  const fetchData = async () => {
    try {
      const data = await apiClient.get('/api/data');
      setData(data);
    } catch (error) {
      // This will display a clean, user-friendly toast notification
      // Only the main error message is shown, technical details are logged to console
      await handleApiError(error, 'Failed to load data', showError);
    }
  };
};
```

#### Error Message Formatting

The error handler provides different levels of detail:

- **With Notification Callback**: Shows only the clean, user-friendly error message
- **Without Callback**: Shows detailed error information including technical details
- **Console Logging**: Always logs full error details for debugging

```javascript
// Clean notification (recommended for user-facing errors)
await handleApiError(error, 'Operation failed', showError);

// Detailed notification (fallback when no callback provided)
await handleApiError(error, 'Operation failed');
```

#### Error Status Codes

The client handles these standard HTTP status codes:
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required or token expired
- **403 Forbidden**: Insufficient permissions (redirects to unauthorized page)
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict
- **500 Internal Server Error**: Server-side error

### 4. Authentication & Security

All API calls must:

- Include valid authentication tokens
- Handle token refresh automatically
- Include tenant/organization context
- Implement proper CORS handling
- Validate input data
- Sanitize response data

### 5. State Management Patterns

#### Local State

- Use for component-specific data
- Implement loading states
- Handle error states
- Manage pagination state

#### Global State

- Use contexts for shared data
- Implement caching strategies
- Handle cross-component updates

### 6. Performance Optimization

Implement these performance patterns:

- Cache API responses when appropriate
- Implement request debouncing
- Use pagination for large datasets
- Optimize re-renders with proper memoization
- Implement request cancellation

```javascript
// Example of request cancellation
useEffect(() => {
  const abortController = new AbortController();
  
  const fetchData = async () => {
    try {
      const response = await fetch(url, {
        signal: abortController.signal
      });
      // Handle response
    } catch (error) {
      if (error.name === 'AbortError') return;
      // Handle other errors
    }
  };

  fetchData();
  
  return () => abortController.abort();
}, [url]);
```

## Example Implementation

Reference the following files for implementation examples:

- `src/services/instructions-api.js`
- `src/components/Instructions/Instructions.jsx`

## Best Practices Summary

1. **Code Organization**
   - Separate concerns (API, UI, state)
   - Use consistent file structure
   - Implement proper typing
   - Follow naming conventions

2. **Error Handling**
   - Implement consistent error handling
   - Show user-friendly error messages
   - Log errors for debugging
   - Handle network failures

3. **Security**
   - Use authentication tokens
   - Validate input data
   - Handle sensitive data
   - Implement proper CORS

4. **Performance**
   - Optimize API calls
   - Implement caching
   - Handle large datasets
   - Monitor performance

## Additional Resources

- [React Query Documentation](https://react-query.tanstack.com/)
- [Auth0 React SDK](https://auth0.com/docs/libraries/auth0-react)
- [REST API Best Practices](https://restfulapi.net/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Keycloak with Docker](https://www.keycloak.org/getting-started/getting-started-docker)
