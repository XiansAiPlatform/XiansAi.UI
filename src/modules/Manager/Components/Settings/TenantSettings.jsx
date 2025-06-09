import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Switch, 
  FormControlLabel,
  Grid
} from '@mui/material';
import { useTenantsApi } from '../../services/tenants-api';

const TenantSettings = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [switchLoading, setSwitchLoading] = useState({});
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

    setSwitchLoading(prev => ({ ...prev, [tenantId]: true }));
    
    try {
      // Update tenant with new enabled status
      await tenantsApi.updateTenant(tenantId, { 
        enabled: !currentlyEnabled 
      });

      // Update the local state
      setTenants(prevTenants => 
        prevTenants.map(tenant => 
          tenant.id === tenantId 
            ? { ...tenant, enabled: !currentlyEnabled, isEnabled: !currentlyEnabled }
            : tenant
        )
      );
    } catch (err) {
      setError(`Failed to ${currentlyEnabled ? 'disable' : 'enable'} tenant. Please try again.`);
      console.error('Error toggling tenant status:', err);
    } finally {
      setSwitchLoading(prev => ({ ...prev, [tenantId]: false }));
    }
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
      <Typography 
        variant="h6" 
        component="h2"
        sx={{
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-primary)',
          mb: 3
        }}
      >
        Tenant Management
      </Typography>
      
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
              const isLoading = switchLoading[tenantId] || false;
              
              return (
                <Paper 
                  key={tenantId || index} 
                  variant="outlined" 
                  sx={{ p: 2, mb: 1 }}
                >
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item xs={8}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {tenant.name || tenant.tenantName || `Tenant ${index + 1}`}
                      </Typography>
                      {tenant.description && (
                        <Typography variant="body2" color="text.secondary">
                          {tenant.description}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={isEnabled}
                            onChange={() => handleToggleEnabled(tenantId, isEnabled)}
                            disabled={isLoading || !tenantId}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isLoading && <CircularProgress size={16} />}
                            <Typography variant="body2">
                              {isEnabled ? 'Enabled' : 'Disabled'}
                            </Typography>
                          </Box>
                        }
                        labelPlacement="start"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TenantSettings; 