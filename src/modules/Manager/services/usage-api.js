import { useMemo } from 'react';
import { useApiClient } from './api-client';

const normalizeDate = (value) => (value ? new Date(value) : null);

const normalizeStatus = (status) => {
  if (!status) return status;

  return {
    ...status,
    windowStart: normalizeDate(status.windowStart),
    windowEndsAt: normalizeDate(status.windowEndsAt),
    tokensUsed: status.tokensUsed ?? 0,
    tokensRemaining: Math.max(0, status.tokensRemaining ?? 0),
  };
};

const normalizeLimit = (limit) => {
  if (!limit) return limit;

  return {
    ...limit,
    createdAt: normalizeDate(limit.createdAt),
    updatedAt: normalizeDate(limit.updatedAt),
    effectiveFrom: normalizeDate(limit.effectiveFrom),
    tokensRemaining: Math.max(0, limit.tokensRemaining ?? 0),
  };
};

export const useUsageApi = () => {
  const api = useApiClient();

  return useMemo(() => ({
    async getTenantUsageStatus({ tenantId, userId } = {}) {
      const data = await api.get('/api/client/usage/status', {
        tenantId,
        userId,
      });
      return normalizeStatus(data);
    },

    async getTenantLimits(tenantId) {
      const data = await api.get('/api/client/usage/limits', { tenantId });
      return Array.isArray(data) ? data.map(normalizeLimit) : [];
    },

    async saveTenantLimit(payload) {
      const result = await api.post('/api/client/usage/limits', payload);
      return normalizeLimit(result);
    },

    async deleteLimit(limitId) {
      if (!limitId) throw new Error('limitId is required');
      await api.delete(`/api/client/usage/limits/${limitId}`);
    },

    async getUsageHistory(params = {}) {
      const data = await api.get('/api/client/usage/history', params);
      return Array.isArray(data)
        ? data.map((entry) => ({
            ...entry,
            windowStart: normalizeDate(entry.windowStart),
            windowEndsAt: normalizeDate(entry.windowEndsAt),
          }))
        : [];
    },
  }), [api]);
};

