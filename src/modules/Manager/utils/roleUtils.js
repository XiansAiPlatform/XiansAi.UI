/**
 * Utility functions for role-based access control
 */

/**
 * Check if user has SysAdmin role
 * @param {Array} userRoles - Array of user role strings
 * @returns {boolean} True if user has SysAdmin role
 */
export const isSysAdmin = (userRoles) => {
  return userRoles && userRoles.includes('SysAdmin');
};

/**
 * Check if user has TenantAdmin role
 * @param {Array} userRoles - Array of user role strings
 * @returns {boolean} True if user has TenantAdmin role
 */
export const isTenantAdmin = (userRoles) => {
  return userRoles && userRoles.includes('TenantAdmin');
};

/**
 * Check if user has SysAdmin or TenantAdmin role
 * @param {Array} userRoles - Array of user role strings
 * @returns {boolean} True if user has admin privileges
 */
export const isAdmin = (userRoles) => {
  return isSysAdmin(userRoles) || isTenantAdmin(userRoles);
};

/**
 * Check if user has a specific role
 * @param {Array} userRoles - Array of user role strings
 * @param {string} roleName - Role name to check
 * @returns {boolean} True if user has the specified role
 */
export const hasRole = (userRoles, roleName) => {
  return userRoles && userRoles.includes(roleName);
};

