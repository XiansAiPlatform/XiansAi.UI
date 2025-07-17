import { useMemo } from 'react';
import { getConfig } from '../../../config';

export const useUserApi = () => {
  return useMemo(() => {
    return {
      getCurrentInvitation: async (token) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/users/currentUserInvitation`;
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const json = await response.json();
          return json;
        } catch (error) {
          console.log('Failed to fetch user tenants:', error);
          throw error;
        }
      },
      postAcceptInvitation: async (token, invitationId) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/users/accept-invitation`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ token: invitationId }),
          });
          if (!response.ok) {
            throw new Error('Failed to accept invitation');
          }
          return true;
        } catch (error) {
          console.log('Failed to accept invitation:', error);
          throw error;
        }
      },
      inviteUser: async (token, email, tenantId) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/users/invite`;
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
            throw new Error("Failed to invite user");
          }
          return true;
        } catch (error) {
          console.log("Failed to invite user:", error);
          throw error;
        }
      },
      getUsers: async (token, filter) => {
        try {
          const { apiBaseUrl } = getConfig();
          // Build query string
          const params = new URLSearchParams({
            page: filter?.page?.toString() || 1,
            pageSize: filter?.pageSize?.toString() || 10,
            type: filter?.filters.type?.toString() || "ALL",
            tenant: filter?.filters.tenant || null,
            search: filter?.filters.search || null,
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
            throw new Error("Failed to fetch users");
          }
          const json = await response.json();
          return json;
        } catch (error) {
          console.log("Failed to fetch users:", error);
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
            throw new Error("Failed to update user");
          }
          return true;
        } catch (error) {
          console.log("Failed to update user:", error);
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
            throw new Error("Failed to delete user");
          }
          return true;
        } catch (error) {
          console.log("Failed to delete user:", error);
          throw error;
        }
      },
      searchUsers: async (token, query) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/users/search?query=${encodeURIComponent(
            query
          )}`;
          const response = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to search users");
          }
          const json = await response.json();
          return json;
        } catch (error) {
          console.log("Failed to search users:", error);
          throw error;
        }
      },
      getInvitations: async (token, tenantId) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/users/invitations/${tenantId}`;
          const response = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Tenant-Id": tenantId,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch invitations");
          }
          const json = await response.json();
          return json
        } catch (error) {
          console.log("Failed to fetch invitations:", error);
          throw error;
        }
      },
      deleteInvitation: async (token, inviteToken, tenantId) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/users/invitations/${inviteToken}`;
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
               "X-Tenant-Id": tenantId,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to delete invitation");
          }
          return true;
        } catch (error) {
          console.log("Failed to delete invitation:", error);
          throw error;
        }
      },
    };
  }, []);
};