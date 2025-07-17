import { useMemo } from 'react';
import { getConfig } from '../../../config';

export const useUserTenantApi = () => {
  return useMemo(() => {
    return {
      getCurrentUserTenant: async (token) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants/current`;
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const json = await response.json();
          return json.data;
        } catch (error) {
          console.log('Failed to fetch user tenants:', error);
          throw error;
        }
      },
      getPendingUserTenantRequests: async (token, tenantId) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants/unapprovedUsers?tenantId=${tenantId}`;
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              "X-Tenant-Id": tenantId,
            },
          });
          const json = await response.json();
          return json.data;
        } catch (error) {
          console.log('Failed to fetch pending user tenant requests:', error);
          throw error;
        }
      },
      approveUserTenantRequest: async (userId, tenantId, token) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants/ApproveUser`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              "X-Tenant-Id": tenantId,
            },
            body: JSON.stringify({ userId, tenantId, isApproved: true }),
          });
          if (!response.ok) {
            throw new Error('Failed to approve user tenant request');
          }
          return true;
        } catch (error) {
          console.log('Failed to approve user tenant request:', error);
          throw error;
        }
      },
      denyUserTenantRequest: async (userId, tenantId, token) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants/ApproveUser`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              "X-Tenant-Id": tenantId,
            },
            body: JSON.stringify({ userId, tenantId, isApproved: false }),
          });
          if (!response.ok) {
            throw new Error('Failed to deny user tenant request');
          }
          return true;
        } catch (error) {
          console.log('Failed to deny user tenant request:', error);
          throw error;
        }
      },
      getUserTenants: async (token) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants`;
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const json = await response.json();
          return json.data;
        } catch (error) {
          console.log('Failed to fetch user tenants:', error);
          throw error;
        }
      },
      getTenantUsers: async (token, filter) => {
        try {
          const { apiBaseUrl } = getConfig();
          const params = new URLSearchParams({
            page: filter?.page?.toString() || 1,
            pageSize: filter?.pageSize?.toString() || 10,
            type: filter?.filters.type?.toString() || "ALL",
            search: filter?.filters.search || null,
          });
          const url = `${apiBaseUrl}/api/user-tenants/tenantUsers?${params.toString()}`;
          const response = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Tenant-Id": filter?.filters.tenant,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch users");
          }
          const json = await response.json();
          return json.data;
        } catch (error) {
          console.log("Failed to fetch users:", error);
          throw error;
        }
      },
      updateTenantUser: async (token, userData, tenant) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants/updateTenantUser`;
          const response = await fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Tenant-Id": tenant,
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
      deleteUserTenant: async (userTenantId, token) => {
        try {
          const { apiBaseUrl } = getConfig();
          const url = `${apiBaseUrl}/api/user-tenants/${userTenantId}`;
          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to delete user tenant');
          }
          return true;
        } catch (error) {
          console.log('Failed to delete user tenant:', error);
          throw error;
        }
      }
    };
  }, []);
};