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
    };
  }, []);
};