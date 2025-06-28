import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useTenantsApi } from '../../services/tenants-api';
import { ContentLoader } from '../Common/StandardLoaders';
import { useTenant } from '../../contexts/TenantContext';
import { useRolesApi } from "../../services/roles-api";

const TenantSettings = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [switchLoading, setSwitchLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    tenantId: '',
    domain: ''
  });
  const [createError, setCreateError] = useState(null);
  const [expandedTenantId, setExpandedTenantId] = useState(null);
  const [admins, setAdmins] = useState({});
  const [adminsLoading, setAdminsLoading] = useState({});
  const tenantsApi = useTenantsApi();
  const { userRoles, isLoading: tenantLoading } = useTenant();
  const rolesApi = useRolesApi();

  // Only allow sysAdmin or tenantAdmin
  const hasAccess = userRoles.includes('SysAdmin') || userRoles.includes('TenantAdmin');

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await tenantsApi.getAllTenants();
        setTenants(response.data || response);
      } catch (err) {
        setError('Failed to fetch tenants. Please try again.');
        console.error('Error fetching tenants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, [tenantsApi]);

  const handleToggleEnabled = async (tenantId, currentlyEnabled) => {
    if (!tenantId) return;
    setSwitchLoading(prev => ({ ...prev, [tenantId]: true }));
    try {
      await tenantsApi.updateTenant(tenantId, { enabled: !currentlyEnabled });
      setTenants(prevTenants =>
        prevTenants.map(tenant => {
          const matchesId = tenant.id === tenantId || tenant.tenantId === tenantId;
          return matchesId
            ? { ...tenant, enabled: !currentlyEnabled, isEnabled: !currentlyEnabled }
            : tenant;
        })
      );
    } catch (err) {
      setError(`Failed to ${currentlyEnabled ? 'disable' : 'enable'} tenant. Please try again.`);
      console.error('Error toggling tenant status:', err);
    } finally {
      setSwitchLoading(prev => ({ ...prev, [tenantId]: false }));
    }
  };

  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
    setCreateError(null);
    setCreateForm({ name: '', description: '', tenantId: '', domain: '' });
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setCreateError(null);
    setCreateForm({ name: '', description: '', tenantId: '', domain: '' });
  };

  const handleCreateFormChange = (field) => (event) => {
    setCreateForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreateTenant = async () => {
    if (!createForm.name.trim()) {
      setCreateError('Tenant name is required');
      return;
    }
    if (!createForm.tenantId.trim()) {
      setCreateError('Tenant ID is required');
      return;
    }
    if (!createForm.domain.trim()) {
      setCreateError('Domain is required');
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const newTenantData = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        tenantId: createForm.tenantId.trim(),
        domain: createForm.domain.trim(),
        enabled: true
      };
      const response = await tenantsApi.createTenant(newTenantData);
      const newTenant = response.data || response;
      const tenantToAdd = {
        ...newTenant,
        id: newTenant.id || newTenant.tenantId || createForm.tenantId.trim(),
        tenantId: newTenant.tenantId || newTenant.id || createForm.tenantId.trim(),
        name: newTenant.name || newTenant.tenantName || createForm.name.trim(),
        tenantName: newTenant.tenantName || newTenant.name || createForm.name.trim(),
        description: newTenant.description || createForm.description.trim(),
        domain: newTenant.domain || createForm.domain.trim(),
        enabled: newTenant.enabled !== undefined ? newTenant.enabled : true,
        isEnabled: newTenant.isEnabled !== undefined ? newTenant.isEnabled : (newTenant.enabled !== undefined ? newTenant.enabled : true)
      };
      setTenants(prevTenants => [...prevTenants, tenantToAdd]);
      handleCreateDialogClose();
      setError(null);
    } catch (err) {
      setCreateError('Failed to create tenant. Please try again.');
      console.error('Error creating tenant:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (!tenantId) return;
    setDeleteLoading(prev => ({ ...prev, [tenantId]: true }));
    try {
      await tenantsApi.deleteTenant(tenantId);
      setTenants(prevTenants => prevTenants.filter(tenant => tenant.id !== tenantId && tenant.tenantId !== tenantId));
      setDeleteConfirmOpen(false);
      setTenantToDelete(null);
      setError(null);
    } catch (err) {
      setError('Failed to delete tenant. Please try again.');
      console.error('Error deleting tenant:', err);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [tenantId]: false }));
    }
  };

  const handleDeleteClick = (tenant) => {
    setTenantToDelete(tenant);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setTenantToDelete(null);
  };

  const handleExpand = async (tenantId) => {
    setExpandedTenantId(expandedTenantId === tenantId ? null : tenantId);
    if (!admins[tenantId] && expandedTenantId !== tenantId) {
      setAdminsLoading((prev) => ({ ...prev, [tenantId]: true }));
      try {
        const response = await rolesApi.getTenantAdmins(tenantId);
        setAdmins((prev) => ({ ...prev, [tenantId]: response.data || response }));
      } catch (err) {
        setAdmins((prev) => ({ ...prev, [tenantId]: [{ name: 'Failed to load admins' }] }));
      } finally {
        setAdminsLoading((prev) => ({ ...prev, [tenantId]: false }));
      }
    }
  };

  if (tenantLoading) {
    return <ContentLoader size="medium" sx={{ height: '200px' }} />;
  }
  if (!hasAccess) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        You do not have permission to view this page.
      </Alert>
    );
  }
  if (loading) {
    return <ContentLoader size="medium" sx={{ height: '200px' }} />;
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}
        >
          Tenant Management
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreateDialogOpen}>
          Create Tenant
        </Button>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Total Tenants: {tenants.length}
        </Typography>
        {tenants.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No tenants found.
          </Typography>
        ) : (
          <Box>
            {tenants.map((tenant, index) => {
              const tenantId = tenant.id || tenant.tenantId;
              const isEnabled = tenant.enabled ?? tenant.isEnabled ?? true;
              const isToggleLoading = switchLoading[tenantId] || false;
              const isDeleteLoading = deleteLoading[tenantId] || false;
              return (
                <Paper key={tenantId || index} variant="outlined" sx={{ p: 2, mb: 1 }}>
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item xs={6}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {tenant.name || tenant.tenantName || `Tenant ${index + 1}`}
                      </Typography>
                      {tenant.description && (
                        <Typography variant="body2" color="text.secondary">
                          {tenant.description}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={isEnabled}
                            onChange={() => handleToggleEnabled(tenantId, isEnabled)}
                            disabled={isToggleLoading || !tenantId}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isToggleLoading && <CircularProgress size={16} />}
                            <Typography variant="body2">
                              {isEnabled ? 'Enabled' : 'Disabled'}
                            </Typography>
                          </Box>
                        }
                        labelPlacement="start"
                      />
                      <Tooltip title="Delete Tenant">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(tenant)}
                          disabled={isDeleteLoading}
                          size="small"
                        >
                          {isDeleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={expandedTenantId === tenantId ? 'Collapse' : 'Expand'}>
                        <IconButton size="small" onClick={() => handleExpand(tenantId)}>
                          {expandedTenantId === tenantId ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                  <Collapse in={expandedTenantId === tenantId} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Admins:
                      </Typography>
                      {adminsLoading[tenantId] ? (
                        <ContentLoader size="small" sx={{ height: '40px' }} />
                      ) : (
                        <List dense>
                          {(admins[tenantId] || []).map((admin, i) => (
                            <ListItem key={admin.id || i}>
                              <ListItemText
                                primary={admin.userId || admin.name || 'Unknown'}
                                secondary={admin.nickname || null}
                              />
                            </ListItem>
                          ))}
                          {(admins[tenantId] || []).length === 0 && (
                            <ListItem>
                              <ListItemText primary="No admins found." />
                            </ListItem>
                          )}
                        </List>
                      )}
                    </Box>
                  </Collapse>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>
      {/* Create Tenant Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Tenant</DialogTitle>
        <DialogContent>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Tenant Name"
            type="text"
            fullWidth
            variant="outlined"
            value={createForm.name}
            onChange={handleCreateFormChange('name')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Tenant ID"
            type="text"
            fullWidth
            variant="outlined"
            value={createForm.tenantId}
            onChange={handleCreateFormChange('tenantId')}
            required
            sx={{ mb: 2 }}
            helperText="Unique identifier for the tenant"
          />
          <TextField
            margin="dense"
            label="Domain"
            type="text"
            fullWidth
            variant="outlined"
            value={createForm.domain}
            onChange={handleCreateFormChange('domain')}
            required
            sx={{ mb: 2 }}
            helperText="Domain associated with this tenant"
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={createForm.description}
            onChange={handleCreateFormChange('description')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose} disabled={createLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateTenant}
            variant="contained"
            disabled={createLoading || !createForm.name.trim() || !createForm.tenantId.trim() || !createForm.domain.trim()}
          >
            {createLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                Creating...
              </Box>
            ) : (
              'Create Tenant'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Tenant</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this tenant?
          </Typography>
          {tenantToDelete && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {tenantToDelete.name || tenantToDelete.tenantName || 'Unknown Tenant'}
              </Typography>
              {tenantToDelete.description && (
                <Typography variant="body2" color="text.secondary">
                  {tenantToDelete.description}
                </Typography>
              )}
            </Paper>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. All data associated with this tenant will be permanently deleted.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading[tenantToDelete?.id || tenantToDelete?.tenantId]}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteTenant(tenantToDelete?.id || tenantToDelete?.tenantId)}
            variant="contained"
            color="error"
            disabled={deleteLoading[tenantToDelete?.id || tenantToDelete?.tenantId]}
          >
            {deleteLoading[tenantToDelete?.id || tenantToDelete?.tenantId] ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                Deleting...
              </Box>
            ) : (
              'Delete Tenant'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantSettings;