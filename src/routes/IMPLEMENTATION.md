# Routing Implementation Details

This document covers the technical implementation details of the routing system.

## Architecture Overview

The application uses a hierarchical routing approach with React Router v7. The architecture consists of:

1. **Centralized Route Constants**: All route paths defined in `routeConstants.js`
2. **Top-level Router**: `AppRoutes.jsx` provides the main routing structure
3. **Module-specific Routers**: Each module has its own router component (e.g., `PublicRoutes.jsx`, `ManagerRoutes.jsx`)
4. **Lazy Loading**: Routes are loaded on demand to optimize initial load time

## Route Naming and Organization

Routes are organized by module with a clear namespace strategy:

- **Public routes**: At root level (`/`, `/login`)
- **Manager routes**: Under `/manager` prefix
- **Agents routes**: Under `/agents` prefix

This organization provides clear separation of concerns and makes it easier to understand the application structure.

## Code Splitting and Lazy Loading

To optimize performance, we use React's lazy loading feature combined with a custom `lazyLoad` utility:

```jsx
const PublicRoutes = lazyLoad(() => import('../modules/Public/PublicRoutes'), { prefetch: true });
```

The `lazyLoad` utility wraps `React.lazy()` with additional features:
- Optional prefetching for critical routes
- Consistent error handling
- Suspense integration

## Error Handling

All routes are wrapped with `ErrorBoundary` components to catch and handle route-level errors:

```jsx
<Route path="/manager/*" element={
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner message="Loading manager module..." />}>
      <ManagerRoutes />
    </Suspense>
  </ErrorBoundary>
} />
```

This ensures that errors in one part of the application don't bring down the entire app.

## Route Helper Functions

For routes with parameters, we use helper functions to create correctly formatted paths:

```jsx
// In routeConstants.js
export const createPath = (pathTemplate, params = {}) => {
  let path = pathTemplate;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  return path;
};

// Usage example
const path = createPath(ROUTES.MANAGER.RUNS_DETAIL, { id: '123', runId: '456' });
// Result: "/manager/runs/123/456"
```

## Future Improvements

Potential enhancements to consider:

1. **Route-based Code Splitting**: Further optimize by splitting at the individual route level
2. **Route Guards**: Add authentication/authorization checks at the route level
3. **Route Analytics**: Add tracking for route changes
4. **Route Transitions**: Add animations between route changes 
