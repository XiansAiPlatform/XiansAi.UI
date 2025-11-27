import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Tooltip,
  CircularProgress,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import UsageStatsCard from './UsageStatsCard';
import UsageLimitForm from './UsageLimitForm';
import PageLayout from '../../Common/PageLayout';
import { useTenantsApi } from '../../../services/tenants-api';
import { useUsageApi } from '../../../services/usage-api';
import { useNotification } from '../../../contexts/NotificationContext';
import { useSlider } from '../../../contexts/SliderContext';

const formatNumber = (value) => new Intl.NumberFormat().format(value ?? 0);

const normalizeTenant = (tenant) => {
  if (!tenant) {
    return { tenantId: '', name: '' };
  }

  if (typeof tenant === 'string') {
    return { tenantId: tenant, name: tenant };
  }

  return {
    tenantId: tenant.tenantId || tenant.id || tenant.domain || '',
    name: tenant.name || tenant.tenantName || tenant.tenantId || tenant.id || tenant.domain || '',
  };
};

const TokenUsageManagement = () => {
  const tenantsApi = useTenantsApi();
  const usageApi = useUsageApi();
  const { showSuccess, showError } = useNotification();
  const { openSlider, closeSlider } = useSlider();

  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [status, setStatus] = useState(null);
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const tenantLimit = useMemo(() => limits.find((limit) => !limit.userId) || null, [limits]);
  const overrides = useMemo(() => limits.filter((limit) => !!limit.userId), [limits]);
  const normalizedTenants = useMemo(() => (tenants || []).map(normalizeTenant).filter((t) => t.tenantId), [tenants]);

  const fetchTenants = useCallback(async () => {
    try {
      const data = await tenantsApi.getTenantList();
      setTenants(data || []);
      const normalized = (data || []).map(normalizeTenant).filter((t) => t.tenantId);
      if (normalized.length && !selectedTenantId) {
        setSelectedTenantId(normalized[0].tenantId);
      }
    } catch (error) {
      showError('Failed to load tenants');
      console.error(error);
    }
  }, [selectedTenantId, showError, tenantsApi]);

  const fetchUsage = useCallback(async () => {
    if (!selectedTenantId) return;
    setRefreshing(true);
    try {
      const [statusResponse, limitsResponse] = await Promise.all([
        usageApi.getTenantUsageStatus({ tenantId: selectedTenantId }),
        usageApi.getTenantLimits(selectedTenantId),
      ]);
      setStatus(statusResponse);
      setLimits(limitsResponse ?? []);
    } catch (error) {
      showError('Failed to load usage data');
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedTenantId, usageApi, showError]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchTenants();
      setLoading(false);
    };
    init();
  }, [fetchTenants]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const handleSelectTenant = (event) => {
    setSelectedTenantId(event.target.value);
  };

  const handleSaveLimit = async (values) => {
    try {
      await usageApi.saveTenantLimit({
        ...values,
        tenantId: selectedTenantId,
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
          tenantId: selectedTenantId,
          maxTokens: tenantLimit?.maxTokens ?? status?.maxTokens ?? 200000,
          windowSeconds: tenantLimit?.windowSeconds ?? status?.windowSeconds ?? 86400,
          enabled: tenantLimit?.enabled ?? true,
        }}
        onCancel={closeSlider}
        onSubmit={handleSaveLimit}
      />,
      'Edit Tenant Limit'
    );
  };

  const handleAddOverride = () => {
    openSlider(
      <UsageLimitForm
        mode="override"
        initialValues={{
          tenantId: selectedTenantId,
          userId: '',
          maxTokens: 50000,
          windowSeconds: 86400,
          enabled: true,
        }}
        onCancel={closeSlider}
        onSubmit={handleSaveLimit}
      />,
      'Add User Override'
    );
  };

  const handleEditOverride = (override) => {
    openSlider(
      <UsageLimitForm
        mode="override"
        initialValues={{
          tenantId: selectedTenantId,
          userId: override.userId,
          maxTokens: override.maxTokens,
          windowSeconds: override.windowSeconds,
          enabled: override.enabled,
        }}
        onCancel={closeSlider}
        onSubmit={handleSaveLimit}
      />,
      `Edit Override for ${override.userId}`
    );
  };

  const handleDeleteOverride = async (override) => {
    try {
      await usageApi.deleteLimit(override.id || override._id);
      showSuccess(`Override removed for ${override.userId}`);
      fetchUsage();
    } catch (error) {
      showError('Failed to delete override');
      console.error(error);
    }
  };

  const effectiveStatus = useMemo(() => {
    if (!status) return null;
    const maxTokens = tenantLimit?.maxTokens ?? status.maxTokens;
    const windowSeconds = tenantLimit?.windowSeconds ?? status.windowSeconds;
    const tokensUsed = status.tokensUsed ?? 0;
    const tokensRemaining = Math.max(0, maxTokens - tokensUsed);
    return {
      ...status,
      maxTokens,
      windowSeconds,
      tokensRemaining,
    };
  }, [status, tenantLimit]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageLayout title="Usage Limits" subtitle="Monitor and manage token quotas across tenants.">
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-paper)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              select
              label="Tenant"
              value={selectedTenantId}
              onChange={handleSelectTenant}
              fullWidth
              helperText="Choose a tenant to view detailed usage information."
            >
              {normalizedTenants.map((tenant) => (
                <MenuItem key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.name || tenant.tenantId}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUsage}
              disabled={!selectedTenantId || refreshing}
            >
              Refresh
            </Button>
          </Stack>
        </Paper>

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
                Applies to all users unless an override is configured.
              </Typography>
            </Box>
            <Button variant="contained" onClick={handleEditTenantLimit} disabled={!selectedTenantId}>
              Edit Limit
            </Button>
          </Stack>

          {tenantLimit ? (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Max Tokens
                </Typography>
                <Typography variant="h6">{formatNumber(tenantLimit.maxTokens)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Window (seconds)
                </Typography>
                <Typography variant="h6">{formatNumber(tenantLimit.windowSeconds)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="h6">{tenantLimit.enabled ? 'Enabled' : 'Disabled'}</Typography>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No custom tenant limit configured. The platform default is applied.
            </Typography>
          )}
        </Paper>

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
              <Typography variant="h6">User Overrides</Typography>
              <Typography variant="body2" color="text.secondary">
                Specific limits for individual users within the selected tenant.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddOverride}
              disabled={!selectedTenantId}
            >
              Add Override
            </Button>
          </Stack>

          {overrides.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No overrides defined yet.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Max Tokens</TableCell>
                    <TableCell>Window (s)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overrides.map((override) => (
                    <TableRow key={override.id || override._id || override.userId}>
                      <TableCell>{override.userId}</TableCell>
                      <TableCell>{formatNumber(override.maxTokens)}</TableCell>
                      <TableCell>{formatNumber(override.windowSeconds)}</TableCell>
                      <TableCell>{override.enabled ? 'Enabled' : 'Disabled'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditOverride(override)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteOverride(override)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Stack>
    </PageLayout>
  );
};

export default TokenUsageManagement;

