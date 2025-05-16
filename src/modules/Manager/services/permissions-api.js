import { useApiClient } from './api-client';

export const usePermissionsApi = () => {
  const apiClient = useApiClient();

  const getPermissions = async (agentName) => {
    return apiClient.get(`/api/client/permissions/agent/${agentName}`);
  };

  const updatePermissions = async (agentName, permissions) => {
    return apiClient.put(`/api/client/permissions/agent/${agentName}`, permissions);
  };

  const addUser = async (agentName, userId, permissionLevel) => {
    return apiClient.post(`/api/client/permissions/agent/${agentName}/users`, {
      userId,
      permissionLevel
    });
  };

  const removeUser = async (agentName, userId) => {
    return apiClient.delete(`/api/client/permissions/agent/${agentName}/users/${userId}`);
  };

  const updateUserPermission = async (agentName, userId, newPermissionLevel) => {
    return apiClient.patch(`/api/client/permissions/agent/${agentName}/users/${userId}/${newPermissionLevel}`);
  };

  return {
    getPermissions,
    updatePermissions,
    addUser,
    removeUser,
    updateUserPermission
  };
}; 