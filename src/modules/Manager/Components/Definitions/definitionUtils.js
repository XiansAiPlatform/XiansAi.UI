import { formatDistanceToNow } from 'date-fns';

/**
 * Groups definitions by agent name and sorts them by most recent activity
 * @param {Array} definitions - Array of definition objects
 * @returns {Object} Object containing grouped definitions, sorted agent names, and latest activity dates
 */
export const groupDefinitionsByAgent = (definitions) => {
  const grouped = {};
  const latestFlowByAgent = {};
  
  definitions.forEach(def => {
    const agentName = def.agent || 'Ungrouped';
    if (!grouped[agentName]) {
      grouped[agentName] = [];
      latestFlowByAgent[agentName] = new Date(0);
    }
    grouped[agentName].push(def);
    
    // Track the most recent flow creation/update date for each agent
    const flowDate = new Date(def.createdAt);
    if (flowDate > latestFlowByAgent[agentName]) {
      latestFlowByAgent[agentName] = flowDate;
    }
  });
  
  // Sort agent names by their most recent flow date (descending)
  const sortedAgentNames = Object.keys(grouped).sort((a, b) => {
    // Special case for 'Ungrouped' - always keep at the end
    if (a === 'Ungrouped') return 1;
    if (b === 'Ungrouped') return -1;
    
    // Sort by most recent flow date (newest first)
    return latestFlowByAgent[b] - latestFlowByAgent[a];
  });
  
  return { grouped, sortedAgentNames, latestFlowByAgent };
};

/**
 * Formats the last updated date in a human-readable format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatLastUpdated = (date) => {
  try {
    return `Updated ${formatDistanceToNow(date, { addSuffix: false })} ago`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Checks if a date is within the last 24 hours
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if the date is within the last 24 hours
 */
export const isRecentlyUpdated = (date) => {
  try {
    const now = new Date();
    const lastUpdated = new Date(date);
    const diffInHours = Math.floor((now - lastUpdated) / (1000 * 60 * 60));
    return diffInHours < 24;
  } catch (error) {
    console.error('Error checking if recently updated:', error);
    return false;
  }
};

/**
 * Formats agent name by adding spaces before capital letters
 * @param {string} name - The agent name to format
 * @returns {string} Formatted agent name
 */
export const formatAgentName = (name) => {
  if (!name) return '';
  return name.replace(/([A-Z])/g, ' $1').trim();
};

/**
 * Filters definitions based on search query
 * @param {Array} definitions - Array of definition objects
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered definitions array
 */
export const filterDefinitions = (definitions, searchQuery) => {
  if (!searchQuery) return definitions;
  
  const searchLower = searchQuery.toLowerCase();
  return definitions.filter(def => {
    const workflowTypeLower = def.workflowType?.toLowerCase() || '';
    const agentNameLower = def.agent?.toLowerCase() || '';
    const descriptionLower = def.description?.toLowerCase() || '';
    
    return workflowTypeLower.includes(searchLower) || 
           agentNameLower.includes(searchLower) ||
           descriptionLower.includes(searchLower);
  });
};

/**
 * Sorts definitions by creation date (newest first)
 * @param {Array} definitions - Array of definition objects
 * @returns {Array} Sorted definitions array
 */
export const sortDefinitionsByDate = (definitions) => {
  return definitions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Checks if user is owner of all workflows for a specific agent
 * @param {string} agentName - The agent name to check
 * @param {Array} definitions - Array of definition objects
 * @param {Object} user - Current user object
 * @returns {boolean} True if user owns all workflows for the agent
 */
export const isUserOwnerOfAllWorkflows = (agentName, definitions, user) => {
  if (!user?.id) return false;
  
  const agentDefinitions = definitions.filter(def => def.agent === agentName);
  return agentDefinitions.every(def => {
    if (def.permissions?.ownerAccess?.includes(user.id)) return true;
    return false;
  });
}; 