import { formatDistanceToNow } from 'date-fns';

/**
 * Filters agent groups based on search query
 * @param {Array} agentGroups - Array of agent group objects
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered agent groups array
 */
export const filterAgentGroups = (agentGroups, searchQuery) => {
  if (!agentGroups || !Array.isArray(agentGroups)) {
    return [];
  }
  
  if (!searchQuery) return agentGroups;
  
  const searchLower = searchQuery.toLowerCase();
  return agentGroups.filter(group => {
    const agentNameLower = group.agent?.name?.toLowerCase() || '';
    
    // Check if agent name matches
    if (agentNameLower.includes(searchLower)) {
      return true;
    }
    
    // Check if any definition in the group matches
    return group.definitions.some(def => {
      const workflowTypeLower = def.workflowType?.toLowerCase() || '';
      const descriptionLower = def.description?.toLowerCase() || '';
      
      return workflowTypeLower.includes(searchLower) || 
             descriptionLower.includes(searchLower);
    });
  });
};

/**
 * Sorts agent groups by their most recent definition date (newest first)
 * @param {Array} agentGroups - Array of agent group objects
 * @returns {Array} Sorted agent groups array
 */
export const sortAgentGroupsByDate = (agentGroups) => {
  if (!agentGroups || !Array.isArray(agentGroups)) {
    return [];
  }
  
  return agentGroups.sort((a, b) => {
    // Get the most recent definition date for each agent group
    const getLatestDate = (group) => {
      if (!group.definitions || group.definitions.length === 0) {
        return new Date(0);
      }
      return group.definitions.reduce((latest, def) => {
        const defDate = new Date(def.createdAt);
        return defDate > latest ? defDate : latest;
      }, new Date(0));
    };
    
    const latestA = getLatestDate(a);
    const latestB = getLatestDate(b);
    
    return latestB - latestA; // Newest first
  });
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
 * Filters definitions based on search query (legacy function for backward compatibility)
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
 * Sorts definitions by creation date (newest first) (legacy function for backward compatibility)
 * @param {Array} definitions - Array of definition objects
 * @returns {Array} Sorted definitions array
 */
export const sortDefinitionsByDate = (definitions) => {
  return definitions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Checks if user is owner of all workflows for a specific agent
 * @param {Object} agent - The agent object containing permissions
 * @param {Object} user - Current user object
 * @returns {boolean} True if user owns all workflows for the agent
 */
export const isUserOwnerOfAllWorkflows = (agent, user) => {
  if (!user?.id || !agent?.permissions) return false;
  
  // Check if user is in the owner access list for the agent
  return agent.permissions.ownerAccess?.includes(user.id) || false;
}; 