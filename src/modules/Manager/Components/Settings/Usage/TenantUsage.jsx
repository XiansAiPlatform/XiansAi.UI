import { useEffect, useState, useCallback } from 'react';
import { Box, Paper, Stack, Typography, Button, CircularProgress } from '@mui/material';
import UsageStatsCard from '../../Admin/Usage/UsageStatsCard';
import UsageLimitForm from '../../Admin/Usage/UsageLimitForm';
import { useUsageApi } from '../../../services/usage-api';
import { useNotification } from '../../../contexts/NotificationContext';
import { useSlider } from '../../../contexts/SliderContext';
import { useTenant } from '../../../contexts/TenantContext';

const TenantUsage = () => {
  const usageApi = useUsageApi();
  const { showError, showSuccess } = useNotification();
  const { openSlider, closeSlider } = useSlider();
  const { tenant } = useTenant();

  const [status, setStatus] = useState(null);
  const [limit, setLimit] = useState(null);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);

  const tenantId = tenant?.tenantId;

  const fetchUsage = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [statusResponse, limitsResponse] = await Promise.all([
        usageApi.getTenantUsageStatus({ tenantId }),
        usageApi.getTenantLimits(tenantId),
      ]);
      setStatus(statusResponse);
      setLimit(limitsResponse.find((item) => !item.userId) || null);
      setOverrides(limitsResponse.filter((item) => item.userId));
    } catch (error) {
      showError('Failed to load usage data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [tenantId, usageApi, showError]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const handleSaveLimit = async (values) => {
    try {
      await usageApi.saveTenantLimit({
        ...values,
        tenantId,
      });
      showSuccess('Usage limit saved');
      closeSlider();
      fetchUsage();
    } catch (error) {
      showError('Failed to save limit');
      console.error(error);
    }
  };

  const handleEditTenantLimit = () => {
    openSlider(
      <UsageLimitForm
        mode="tenant"
        initialValues={{
          tenantId,
          maxTokens: limit?.maxTokens ?? status?.maxTokens ?? 200000,
          windowSeconds: limit?.windowSeconds ?? status?.windowSeconds ?? 86400,
          enabled: limit?.enabled ?? true,
        }}
        onCancel={closeSlider}
        onSubmit={handleSaveLimit}
      />,
      'Edit Tenant Usage Limit'
    );
  };

  if (!tenantId) {
    return (
      <Typography variant="body2" color="text.secondary">
        Select a tenant context to manage usage settings.
      </Typography>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  const effectiveStatus = status
    ? {
        ...status,
        maxTokens: limit?.maxTokens ?? status.maxTokens,
        windowSeconds: limit?.windowSeconds ?? status.windowSeconds,
        tokensRemaining: Math.max(0, (limit?.maxTokens ?? status.maxTokens) - (status.tokensUsed ?? 0)),
      }
    : null;

  return (
    <Stack spacing={3}>
      <UsageStatsCard status={effectiveStatus} />

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-paper)',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6">Tenant Default Limit</Typography>
            <Typography variant="body2" color="text.secondary">
              Applies to all users unless specific overrides are configured by a system admin.
            </Typography>
          </Box>
          <Button variant="contained" onClick={handleEditTenantLimit}>
            Edit Limit
          </Button>
        </Stack>

        {limit ? (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Max Tokens
              </Typography>
              <Typography variant="h6">{limit.maxTokens.toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Window (seconds)
              </Typography>
              <Typography variant="h6">{limit.windowSeconds.toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="h6">{limit.enabled ? 'Enabled' : 'Disabled'}</Typography>
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No custom tenant limit configured. Platform default is applied.
          </Typography>
        )}
      </Paper>

      {overrides.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-paper)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            User Overrides
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`Overrides are managed by system admins. ${overrides.length} user(s) currently have custom limits.`}
          </Typography>
        </Paper>
      )}
    </Stack>
  );
};

export default TenantUsage;

