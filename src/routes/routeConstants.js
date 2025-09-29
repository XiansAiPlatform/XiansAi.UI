/**
 * Central route definitions for the application
 * This provides a single source of truth for all route paths
 */
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CALLBACK: '/callback',
  
  // Manager routes
  MANAGER: {
    ROOT: '/manager',
    RUNS: '/manager/runs',
    RUNS_DETAIL: '/manager/runs/:id/:runId',
    DEFINITIONS: '/manager/definitions',
    KNOWLEDGE: '/manager/knowledge',
    SETTINGS: '/manager/settings',
    MESSAGING: '/manager/messaging',
    AUDITING: '/manager/auditing',
    //UNAUTHORIZED: '/manager/unauthorized',
    LOGOUT: '/manager/logout',
  },
  
  // Agents routes
  AGENTS: {
    ROOT: '/agents',
    EXPLORE: '/agents/explore',
    CHAT: '/agents/chat',
    CHAT_WITH_AGENT: '/agents/chat/:agentId',
  },
  
  // Legacy routes for backward compatibility during transition
  // LEGACY: {
  //   RUNS: '/runs',
  //   RUNS_DETAIL: '/runs/:id/:runId',
  //   DEFINITIONS: '/definitions',
  //   KNOWLEDGE: '/knowledge',
  //   SETTINGS: '/settings',
  //   MESSAGING: '/messaging',
  //   AUDITING: '/auditing',
  //   UNAUTHORIZED: '/unauthorized',
  //   LOGOUT: '/logout',
  // }
};

/**
 * Helper function to get a fully qualified path
 * Useful for nested routes or generating paths with parameters
 */
export const getRoutePath = (basePath, relativePath) => {
  // Remove trailing slash from base and leading slash from relative
  const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const cleanRelative = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${cleanBase}/${cleanRelative}`;
};

/**
 * Helper to create a path with parameters
 * Example: createPath(ROUTES.MANAGER.RUNS_DETAIL, { id: '123', runId: '456' })
 */
export const createPath = (pathTemplate, params = {}) => {
  let path = pathTemplate;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  return path;
}; 
