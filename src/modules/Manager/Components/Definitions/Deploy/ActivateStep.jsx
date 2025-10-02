import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  PlayArrow as ActivateIcon,
  CheckCircle as SuccessIcon,
  CheckCircle,
  Error as ErrorIcon,
  Settings as WorkflowIcon
} from '@mui/icons-material';
import { useWorkflowApi } from '../../../services/workflow-api';
import { useSelectedOrg } from '../../../contexts/OrganizationContext';
import { useNotification } from '../../../contexts/NotificationContext';

const ActivateStep = ({ 
  stepData, 
  agentName,
  onComplete,
  onError 
}) => {
  const [selectedWorkflows, setSelectedWorkflows] = useState([]);
  const [isActivating, setIsActivating] = useState(false);
  const [activationResults, setActivationResults] = useState({});
  const [allActivated, setAllActivated] = useState(false);
  
  const workflowApi = useWorkflowApi();
  const { selectedOrg } = useSelectedOrg();
  const { showSuccess, showError } = useNotification();

  // Initialize with all workflows selected
  React.useEffect(() => {
    if (stepData.value && Array.isArray(stepData.value)) {
      setSelectedWorkflows(stepData.value);
    }
  }, [stepData.value]);

  const handleToggleWorkflow = (workflow) => {
    setSelectedWorkflows(prev => {
      if (prev.includes(workflow)) {
        return prev.filter(w => w !== workflow);
      } else {
        return [...prev, workflow];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedWorkflows.length === stepData.value.length) {
      setSelectedWorkflows([]);
    } else {
      setSelectedWorkflows(stepData.value);
    }
  };

  const extractWorkflowInfo = (workflowName) => {
    // Extract workflow type from the workflow name
    return workflowName;
  };

  const handleActivate = async () => {
    if (selectedWorkflows.length === 0) {
      showError('Please select at least one workflow to activate');
      return;
    }

    try {
      setIsActivating(true);
      setActivationResults({});
      
      const results = {};
      let successCount = 0;
      let failureCount = 0;

      // Activate each selected workflow
      for (const workflowName of selectedWorkflows) {
        try {
          const workflowType = extractWorkflowInfo(workflowName);
          const flowId = `${selectedOrg}:${workflowType}`;
          
          await workflowApi.startNewWorkflow(
            workflowType,
            agentName,
            [],
            flowId,
            null
          );
          
          results[workflowName] = { success: true };
          successCount++;
        } catch (error) {
          console.error(`Failed to activate workflow ${workflowName}:`, error);
          results[workflowName] = { 
            success: false, 
            error: error.message || 'Activation failed' 
          };
          failureCount++;
        }
      }

      setActivationResults(results);
      
      if (successCount > 0 && failureCount === 0) {
        showSuccess(`Successfully activated ${successCount} workflow${successCount > 1 ? 's' : ''}`);
        setAllActivated(true);
      } else if (successCount > 0 && failureCount > 0) {
        showError(`Activated ${successCount} workflow${successCount > 1 ? 's' : ''}, ${failureCount} failed`);
      } else {
        showError('Failed to activate workflows');
      }

      // Notify parent about completion
      if (onComplete) {
        onComplete({
          type: 'activate',
          name: stepData.name,
          success: failureCount === 0,
          results: results
        });
      }
    } catch (error) {
      console.error('Activation failed:', error);
      showError('Failed to activate workflows: ' + error.message);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsActivating(false);
    }
  };

  const getWorkflowStatus = (workflow) => {
    if (!activationResults[workflow]) return null;
    return activationResults[workflow].success ? 'success' : 'error';
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          {!allActivated && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Select the workflows you want to activate. These workflows will start running 
                  immediately after activation.
                </Typography>
              </Alert>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Available Workflows
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleSelectAll}
                    sx={{ textTransform: 'none' }}
                  >
                    {selectedWorkflows.length === stepData.value.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>
                
                <List sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                  {stepData.value.map((workflow, index) => {
                    const status = getWorkflowStatus(workflow);
                    return (
                      <ListItem 
                        key={index}
                        sx={{ 
                          py: 1.5,
                          borderBottom: index < stepData.value.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {status === 'success' ? (
                            <SuccessIcon sx={{ color: 'success.main' }} />
                          ) : status === 'error' ? (
                            <ErrorIcon sx={{ color: 'error.main' }} />
                          ) : (
                            <Checkbox
                              edge="start"
                              checked={selectedWorkflows.includes(workflow)}
                              onChange={() => handleToggleWorkflow(workflow)}
                              disabled={isActivating || status !== null}
                            />
                          )}
                        </ListItemIcon>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <WorkflowIcon sx={{ color: 'text.secondary' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={workflow}
                          secondary={
                            status === 'error' && activationResults[workflow]?.error
                              ? activationResults[workflow].error
                              : null
                          }
                          primaryTypographyProps={{
                            sx: { 
                              fontWeight: 500,
                              color: status === 'success' ? 'success.main' : 
                                     status === 'error' ? 'error.main' : 'text.primary'
                            }
                          }}
                        />
                        {status === 'success' && (
                          <Chip 
                            label="Active" 
                            size="small" 
                            color="success" 
                            variant="outlined"
                          />
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isActivating ? <CircularProgress size={20} /> : <ActivateIcon />}
                  onClick={handleActivate}
                  disabled={isActivating || selectedWorkflows.length === 0}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {isActivating ? 'Activating...' : `Activate ${selectedWorkflows.length} Workflow${selectedWorkflows.length !== 1 ? 's' : ''}`}
                </Button>
              </Box>
            </>
          )}

          {allActivated && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'success.main', fontWeight: 600 }}>
                Workflows Activated!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                The selected workflows are now running and processing data.
              </Typography>
              
              <List sx={{ bgcolor: 'success.50', borderRadius: 1, p: 2 }}>
                {Object.entries(activationResults).map(([workflow, result], index) => (
                  result.success && (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={workflow}
                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                      />
                    </ListItem>
                  )
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ActivateStep;
