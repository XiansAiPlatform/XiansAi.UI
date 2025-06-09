import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useTenantsApi } from '../../services/tenants-api';

const TenantSettings = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
            {tenants.map((tenant, index) => (
              <Paper 
                key={tenant.id || index} 
                variant="outlined" 
                sx={{ p: 2, mb: 1 }}
              >
                <Typography variant="body1">
                  {tenant.name || tenant.tenantName || `Tenant ${index + 1}`}
                </Typography>
                {tenant.description && (
                  <Typography variant="body2" color="text.secondary">
                    {tenant.description}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TenantSettings; 