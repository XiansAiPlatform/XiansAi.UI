// Utility functions for conversation components

/**
 * Formats a date as a relative time string (e.g. "2 minutes ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time
 */
export const getRelativeTimeString = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSecs < 60) {
        return 'just now';
    } else if (diffInMins < 60) {
        return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays === 1) {
        return 'yesterday';
    } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    } else {
        // For older dates, show the actual date
        return date.toLocaleDateString();
    }
};

/**
 * Format status string for display
 * @param {string} status - Status string in camelCase or PascalCase
 * @returns {string} Formatted status with spaces and capitalized
 */
export const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Add spaces before capital letters and capitalize first letter
    return status
        .replace(/([A-Z])/g, ' $1')
        .replace(/^\s/, '')
        .replace(/^./, str => str.toUpperCase());
}; 