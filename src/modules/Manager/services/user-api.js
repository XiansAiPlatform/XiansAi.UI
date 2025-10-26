import { useMemo } from 'react';
import { getConfig } from '../../../config';

/**
 * Helper function to extract error message from response
 * Handles multiple error formats: { error: "msg" }, { message: "msg" }, or plain text
 */
const extractErrorMessage = async (response) => {
  let errorMessage = 'An error occurred';
  
  try {
    const errorData = await response.json();
    if (errorData && errorData.error) {
      errorMessage = errorData.error;
    } else if (errorData && errorData.message) {
      errorMessage = errorData.message;
    } else if (typeof errorData === 'string') {
      errorMessage = errorData;
    }
  } catch (parseError) {
    // If JSON parsing fails, try to get text response
    try {
      const textResponse = await response.text();
      if (textResponse && textResponse.trim()) {
        errorMessage = textResponse;
      }
    } catch (textError) {
      // Use status-based error message as fallback
      switch (response.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Authentication required. Please log in again.';
          break;
        case 403:
          errorMessage = 'Access forbidden. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Server error (${response.status}). Please try again later.`;
      }
    }
  }
  
  return errorMessage;
};

export const useUserApi = () => {
  return useMemo(() => {
    return {
      inviteUser: async (token, email, tenantId) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants/invite`;
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Tenant-Id": tenantId,
            },
            body: JSON.stringify({ email, tenantId }),
          });
          
          if (!response.ok) {
            const errorMessage = await extractErrorMessage(response);
            throw new Error(errorMessage);
          }
          
          return true;
        } catch (error) {
          console.error("Failed to invite user:", error);
          throw error;
        }
      },
      getUsers: async (token, filter) => {
        try {
          const { apiBaseUrl } = getConfig();
          // Build query string
          const params = new URLSearchParams({
            page: filter?.page?.toString() || '1',
            pageSize: filter?.pageSize?.toString() || '10',
            type: filter?.filters.type?.toString() || "ALL",
            tenant: filter?.filters.tenant || '',
            search: filter?.filters.search || '',
          });
          const url = `${apiBaseUrl}/api/users/all?${params.toString()}`;
          const response = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Tenant-Id": "default",
            },
          });
          
          if (!response.ok) {
            const errorMessage = await extractErrorMessage(response);
            throw new Error(errorMessage);
          }
          
          const json = await response.json();
          return json;
        } catch (error) {
          console.error("Failed to fetch users:", error);
          throw error;
        }
      },
      updateUser: async (token, userData) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/users/update`;
          const response = await fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Tenant-Id": "default",
            },
            body: JSON.stringify(userData),
          });
          
          if (!response.ok) {
            const errorMessage = await extractErrorMessage(response);
            throw new Error(errorMessage);
          }
          
          return true;
        } catch (error) {
          console.error("Failed to update user:", error);
          throw error;
        }
      },
      deleteUser: async (token, userId) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/users/${userId}`;
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Tenant-Id": "default",
            },
          });
          
          if (!response.ok) {
            const errorMessage = await extractErrorMessage(response);
            throw new Error(errorMessage);
          }
          
          return true;
        } catch (error) {
          console.error("Failed to delete user:", error);
          throw error;
        }
      },
      searchUsers: async (token, query) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants/search?query=${encodeURIComponent(
            query
          )}`;
          const response = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            const errorMessage = await extractErrorMessage(response);
            throw new Error(errorMessage);
          }
          
          const json = await response.json();
          return json;
        } catch (error) {
          console.error("Failed to search users:", error);
          throw error;
        }
      },
      getInvitations: async (token, tenantId) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants/invitations`;
          const response = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Tenant-Id": tenantId,
            },
          });
          
          if (!response.ok) {
            const errorMessage = await extractErrorMessage(response);
            throw new Error(errorMessage);
          }
          
          const json = await response.json();
          return json;
        } catch (error) {
          console.error("Failed to fetch invitations:", error);
          throw error;
        }
      },
      deleteInvitation: async (token, inviteToken, tenantId) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants/invitations/${inviteToken}`;
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Tenant-Id": tenantId,
            },
          });
          
          if (!response.ok) {
            const errorMessage = await extractErrorMessage(response);
            throw new Error(errorMessage);
          }
          
          return true;
        } catch (error) {
          console.error("Failed to delete invitation:", error);
          throw error;
        }
      },
    };
  }, []);
};