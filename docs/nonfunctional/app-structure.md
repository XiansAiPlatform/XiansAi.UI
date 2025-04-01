# React Application Structure

This document outlines the structure of our React application, providing an overview of the main components, organization, and architectural patterns.

## Main Entry Point

### App.jsx

- Location: `/src/App.jsx`
- Purpose: Main entry point that sets up routing and global providers
- Key responsibilities:
  - Sets up routing using React Router with BrowserRouter, Routes, and Route components
  - Wraps the application with multiple context providers (NotificationProvider, OrganizationProvider, ThemeProvider, LoadingProvider, SliderProvider)
  - Implements protected routes using Auth0 authentication
  - Manages the global layout structure
  - Handles authentication flow including login, logout, and callbacks

## Project Organization

### Components

- Location: `/src/components/`
- Structure:
  - Organized by feature/domain in separate directories
  - Each feature has its own directory with related components
- Some components:
  - `Layout/` - Contains components for the application's layout structure
  - `Runs/` - Components for workflow runs and execution details
  - `Definitions/` - Components for workflow definitions
  - `Instructions/` - Components for displaying and managing instructions
  - `Common/` - Reusable UI components like Toaster
  - `Public/` - Components for public pages like Home and Registration
  - `Settings/` - Application settings components
  - `NotImplemented/` - Placeholder for features not yet implemented

### Authentication

- Location: `/src/auth/`
- Components:
  - `ProtectedRoute.jsx` - Route wrapper for authentication-protected pages
  - `Callback.jsx` - Handles authentication callback
  - `Login.jsx` - Login component

### Contexts

- Location: `/src/contexts/`
- Available contexts:
  - `NotificationContext.jsx` - Manages application notifications
  - `OrganizationContext.js` - Manages organization-related state
  - `LoadingContext.jsx` - Handles loading states across the application
  - `SliderContext.jsx` - Manages slider component states

### Services

- Location: `/src/services/`
- Service modules:
  - `api-client.js` - Core API client implementation
  - `workflow-api.js` - API functions for workflow operations
  - `definitions-api.js` - API functions for workflow definitions
  - `instructions-api.js` - API functions for instructions
  - `activities-api.js` - API functions for activity operations
  - `settings-api.js` - API functions for application settings
  - `registration-api.js` - API functions for user registration
  - `index.js` - Service exports

### Theme

- Location: `/src/theme/`
- Implementation: Using Material UI ThemeProvider with custom theme
- Structure:
  - `mui-theme.js` - Material UI theme configuration
  - `theme.css` - Additional CSS styles
  - SVG assets for UI elements (agent icons, etc.)

### Utils

- Location: `/src/utils/`
- Key utilities:
  - `errorHandler.js` - Error handling functions
  - `useInterval.js` - Custom hook for interval functionality
  - `history.js` - Navigation history utility

## Configuration

- `config.js` - Application configuration settings
- `.env.development` and `.env.production` - Environment-specific configuration
