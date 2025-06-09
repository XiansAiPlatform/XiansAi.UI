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
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTenantsApi } from '../../services/tenants-api';

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
  const tenantsApi = useTenantsApi();

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
    if (!tenantId) {
      console.error('No tenant ID provided for toggle');
      return;
    }

    console.log('Toggle attempt - tenantId:', tenantId, 'currentlyEnabled:', currentlyEnabled);

    setSwitchLoading(prev => ({ ...prev, [tenantId]: true }));
    
    try {
      // Update tenant with new enabled status
      await tenantsApi.updateTenant(tenantId, { 
        enabled: !currentlyEnabled 
      });

      // Update the local state - check both id and tenantId fields
      setTenants(prevTenants => 
        prevTenants.map(tenant => {
          const matchesId = tenant.id === tenantId || tenant.tenantId === tenantId;
          console.log('Checking tenant:', { 
            'tenant.id': tenant.id, 
            'tenant.tenantId': tenant.tenantId, 
            'targetId': tenantId, 
            'matches': matchesId 
          });
          
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
    setCreateForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
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

      console.log('Creating tenant with data:', newTenantData);
      const response = await tenantsApi.createTenant(newTenantData);
      const newTenant = response.data || response;
      console.log('Server response for created tenant:', newTenant);

      // Map the server response to match the expected UI format
      const tenantToAdd = {
        // Prioritize server response for ID, but ensure both formats are available
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

      console.log('Tenant being added to state:', tenantToAdd);
      console.log('Tenant ID fields check:', { 
        'id': tenantToAdd.id, 
        'tenantId': tenantToAdd.tenantId,
        'formTenantId': createForm.tenantId.trim()
      });

      // Add the new tenant to the local state
      setTenants(prevTenants => [...prevTenants, tenantToAdd]);
      
      // Close the dialog and reset form
      handleCreateDialogClose();
      
      // Clear any existing errors
      setError(null);
    } catch (err) {
      setCreateError('Failed to create tenant. Please try again.');
      console.error('Error creating tenant:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (!tenantId) {
      console.error('No tenant ID provided for deletion');
      return;
    }

    setDeleteLoading(prev => ({ ...prev, [tenantId]: true }));

    try {
      await tenantsApi.deleteTenant(tenantId);
      
      // Update the local state - remove the deleted tenant
      setTenants(prevTenants => 
        prevTenants.filter(tenant => 
          tenant.id !== tenantId && tenant.tenantId !== tenantId
        )
      );
      
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
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
          sx={{
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)'
          }}
        >
          Tenant Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleCreateDialogOpen}
        >
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
                <Paper 
                  key={tenantId || index} 
                  variant="outlined" 
                  sx={{ p: 2, mb: 1 }}
                >
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
                          {isDeleteLoading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* Create Tenant Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={handleCreateDialogClose}
        maxWidth="sm"
        fullWidth
      >
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
          <Button 
            onClick={handleCreateDialogClose}
            disabled={createLoading}
          >
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
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
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
          <Button 
            onClick={handleDeleteCancel}
            disabled={deleteLoading[tenantToDelete?.id || tenantToDelete?.tenantId]}
          >
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