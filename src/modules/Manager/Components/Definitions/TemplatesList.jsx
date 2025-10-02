import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Alert, 
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import PageLayout from '../Common/PageLayout';
import TemplateCard from './TemplateCard';
import EmptyState from '../Common/EmptyState';
import { useTemplatesApi } from '../../services';
import { useNotification } from '../../contexts/NotificationContext';

const TemplatesList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deployDialog, setDeployDialog] = useState({ open: false, template: null });
  const [deployConfig, setDeployConfig] = useState({
    agentName: '',
    systemScoped: false
  });
  const [deploying, setDeploying] = useState(false);

  const templatesApi = useTemplatesApi();
  const { showNotification } = useNotification();

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await templatesApi.getAgentTemplates(false);
      setTemplates(data);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err.message || 'Failed to load agent templates');
    } finally {
      setLoading(false);
    }
  }, [templatesApi]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleDeploy = (template) => {
    setDeployDialog({ open: true, template });
    setDeployConfig({
      agentName: `${template.name}-copy`,
      systemScoped: false
    });
  };

  const handleViewDetails = (template) => {
    // For now, just show a notification. In a real app, this would navigate to a details page
    showNotification(`Viewing details for ${template.name}`, 'info');
  };

  const handleDeployConfirm = async () => {
    if (!deployDialog.template || !deployConfig.agentName.trim()) {
      showNotification('Please provide a valid agent name', 'error');
      return;
    }

    try {
      setDeploying(true);
      await templatesApi.deployTemplate(deployDialog.template.name, deployConfig);
      showNotification(`Template "${deployDialog.template.name}" deployed successfully as "${deployConfig.agentName}"`, 'success');
      setDeployDialog({ open: false, template: null });
      setDeployConfig({ agentName: '', systemScoped: false });
    } catch (err) {
      console.error('Error deploying template:', err);
      showNotification(err.message || 'Failed to deploy template', 'error');
    } finally {
      setDeploying(false);
    }
  };

  const handleDeployCancel = () => {
    setDeployDialog({ open: false, template: null });
    setDeployConfig({ agentName: '', systemScoped: false });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Paper sx={{ p: 2, height: 280 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Box>
                </Box>
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="90%" height={20} />
                <Skeleton variant="text" width="70%" height={20} />
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="rectangular" width="100%" height={36} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (error) {
      return (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={loadTemplates}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      );
    }

    if (!templates || templates.length === 0) {
      return (
        <EmptyState
          title="No Templates Available"
          description="There are currently no system-scoped agent templates available for deployment. Templates are created by system administrators and provide pre-configured agent workflows that can be quickly deployed. Contact your administrator to create new templates or check back later for available options."
          context="templates"
        />
      );
    }

    return (
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.agent.id}>
            <TemplateCard
              template={template}
              onDeploy={handleDeploy}
              onViewDetails={handleViewDetails}
              isDeploying={deploying && deployDialog.template?.id === template.agent.id}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <PageLayout
      title="Agent Templates"
      subtitle="Deploy pre-configured agent templates to quickly set up new workflows"
    >
      {renderContent()}

      {/* Deploy Dialog */}
      <Dialog 
        open={deployDialog.open} 
        onClose={handleDeployCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Deploy Template: {deployDialog.template?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="New Agent Name"
              type="text"
              fullWidth
              variant="outlined"
              value={deployConfig.agentName}
              onChange={(e) => setDeployConfig(prev => ({ ...prev, agentName: e.target.value }))}
              helperText="Enter a unique name for the new agent instance"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={deployConfig.systemScoped}
                  onChange={(e) => setDeployConfig(prev => ({ ...prev, systemScoped: e.target.checked }))}
                />
              }
              label="System Scoped Agent"
              sx={{ mt: 2 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              System scoped agents are available across all tenants (requires admin privileges)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeployCancel}>Cancel</Button>
          <Button 
            onClick={handleDeployConfirm} 
            variant="contained"
            disabled={deploying || !deployConfig.agentName.trim()}
          >
            {deploying ? 'Deploying...' : 'Deploy'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default TemplatesList;
