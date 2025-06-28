import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, Collapse, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useTenantsApi } from '../../services/tenants-api';
import { ContentLoader } from '../Common/StandardLoaders';
import { useTenant } from '../../contexts/TenantContext';
import { useRolesApi } from "../../services/roles-api";

const TenantSettings = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const handleExpand = async (tenantId) => {
    setExpandedTenantId(expandedTenantId === tenantId ? null : tenantId);

    // Only fetch admins if not already loaded
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
                sx={{ p: 2, mb: 1, cursor: 'pointer' }}
                onClick={() => handleExpand(tenant.name || `Tenant${index + 1}`)}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body1">
                      {tenant.name || tenant.tenantName || `Tenant ${index + 1}`}
                    </Typography>
                    {tenant.description && (
                      <Typography variant="body2" color="text.secondary">
                        {tenant.description}
                      </Typography>
                    )}
                  </Box>
                  <IconButton size="small">
                    {expandedTenantId === (tenant.name || `Tenant${index + 1}`) ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                <Collapse in={expandedTenantId === (tenant.name || `Tenant${index + 1}`)} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Admins:
                    </Typography>
                    {adminsLoading[tenant.name || `Tenant${index + 1}`] ? (
                      <ContentLoader size="small" sx={{ height: '40px' }} />
                    ) : (
                      <List dense>
                        {(admins[tenant.name || `Tenant${index + 1}`] || []).map((admin, i) => (
                          <ListItem key={admin.id || i}>
                            <ListItemText
                              primary={admin.userId || 'Unknown'}
                              secondary={admin.nickname || null}
                            />
                          </ListItem>
                        ))}
                        {(admins[tenant.name || `Tenant${index + 1}`] || []).length === 0 && (
                          <ListItem>
                            <ListItemText primary="No admins found." />
                          </ListItem>
                        )}
                      </List>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TenantSettings;