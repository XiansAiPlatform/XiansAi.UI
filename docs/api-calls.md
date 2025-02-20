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

```javascript
export const useEntityApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { selectedOrg } = useSelectedOrg();

  return useMemo(() => {
    const createAuthHeaders = async () => ({
      'Authorization': `Bearer ${await getAccessToken()}`,
      'Content-Type': 'application/json',
      'X-Tenant-Id': selectedOrg
    });

    return {
      create: async (data) => {
        const headers = await createAuthHeaders();
        // API implementation
      },
      getAll: async () => {
        const headers = await createAuthHeaders();
        // API implementation
      }
      // Additional methods...
    };
  }, [dependencies]);
};
```

#### Key Patterns:

- Use `useMemo` to memoize API methods
- Implement consistent error handling
- Include authentication and headers setup
- Return a structured API methods object
- Use TypeScript interfaces for type safety

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

#### Best Practices:

- Separate data fetching from UI rendering
- Implement loading and error states
- Use appropriate dependency arrays in hooks
- Handle component unmounting
- Implement data refresh strategies

### 3. Error Handling

Implement consistent error handling across the application:

```javascript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw await handleApiError(response);
  }
  
  return await response.json();
} catch (error) {
  console.error('Operation failed:', error);
  throw error;
}
```

### 4. Authentication & Security

All API calls must:

- Include valid authentication tokens
- Handle token refresh automatically
- Include tenant/organization context
- Implement proper CORS handling
- Validate input data
- Sanitize response data

### 5. State Management Patterns

#### Local State:

- Use for component-specific data
- Implement loading states
- Handle error states
- Manage pagination state

#### Global State:

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

### 7. Testing Strategies

#### Unit Tests:
- Mock API calls
- Test loading states
- Test error handling
- Verify component behavior

```javascript
test('handles API error correctly', async () => {
  // Mock API error
  api.getAll.mockRejectedValue(new Error('API Error'));
  
  render(<EntityComponent />);
  
  // Verify error state
  expect(await screen.findByText('Error loading data')).toBeInTheDocument();
});
```

#### Integration Tests:

- Test API integration
- Verify data flow
- Test error scenarios
- Validate state updates

### 8. Documentation

Document your API implementations:
- Include TypeScript interfaces
- Document error handling
- Provide usage examples
- Include API response examples

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

5. **Testing**
   - Write comprehensive tests
   - Mock external dependencies
   - Test error scenarios
   - Implement E2E tests

## Additional Resources

- [React Query Documentation](https://react-query.tanstack.com/)
- [Auth0 React SDK](https://auth0.com/docs/libraries/auth0-react)
- [REST API Best Practices](https://restfulapi.net/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
