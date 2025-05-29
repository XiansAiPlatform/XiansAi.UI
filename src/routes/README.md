# Routing System

This directory contains the central routing architecture for the application. The routing system is designed to be modular, maintainable, and follows best practices for React Router v7.

## Structure

- `AppRoutes.jsx`: The main routing component that defines the global route structure
- `routeConstants.js`: Central location for all route path definitions
- `IMPLEMENTATION.md`: Technical details about implementation decisions and patterns
- `README.md`: This file, providing an overview of the routing system

## Key Features

- **Centralized Route Management**: All routes are defined in one place for easy maintenance
- **Hierarchical Structure**: Routes are organized by module with clear namespaces
- **Code Splitting**: Each module's routes are loaded dynamically for better performance
- **Backward Compatibility**: Legacy routes are redirected to new routes while preserving path parameters
- **Error Handling**: All routes are wrapped with error boundaries

## Route Organization

The application routes are organized into three main sections:

1. **Public Routes** - Root level routes for authentication and public pages
   - `/` - Home page
   - `/login` - Login page
   - `/register` - Registration page
   - `/callback` - Authentication callback

2. **Manager Routes** - Administrative interface routes under `/manager/` prefix
   - `/manager/runs` - Workflow runs
   - `/manager/definitions` - Workflow definitions
   - `/manager/knowledge` - Knowledge management
   - `/manager/settings` - Application settings
   - `/manager/messaging` - Messaging functionality
   - `/manager/auditing` - Audit logs

3. **Agents Routes** - Agent-related functionality under `/agents/` prefix
   - `/agents/explore` - Explore available agents
   - `/agents/chat` - Chat with agents
   - `/agents/chat/:agentId` - Chat with specific agent

## Usage

When adding new routes, follow these guidelines:

1. Add the route constant to `routeConstants.js` under the appropriate namespace
2. Use the constants when referencing routes in components (avoid hardcoding paths)
3. For routes with parameters, use the helper functions in `routeConstants.js`
4. Add the actual route definition in the module-specific route component

Example of using route constants:

```jsx
import { ROUTES, createPath } from '../routes/routeConstants';

// Simple route
<Link to={ROUTES.MANAGER.RUNS}>View Runs</Link>

// Route with parameters
const agentId = "agent-123";
<Link to={createPath(ROUTES.AGENTS.CHAT_WITH_AGENT, { agentId })}>
  Chat with Agent
</Link>
```

For more detailed information about the implementation, see [IMPLEMENTATION.md](./IMPLEMENTATION.md). 
