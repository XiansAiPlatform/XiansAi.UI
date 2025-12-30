import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Rocket as DeployIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApiClient } from '../../../services/api-client';
import { useScheduleApi } from '../../../services/schedule-api';
import KnowledgeStep from './KnowledgeStep';
import DeployStep from './DeployStep';
import ActivateStep from './ActivateStep';

const DeploymentWizard = ({ template, onDeploy, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [stepResults, setStepResults] = useState({});
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const [deploymentError, setDeploymentError] = useState(null);
  const [isConflict, setIsConflict] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { agent } = template;
  const apiClient = useApiClient();
  const scheduleApi = useScheduleApi();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract workflow steps from onboardingJson (excluding deploy type)
  useEffect(() => {
    try {
      let parsedData = null;
      if (agent.onboardingJson && typeof agent.onboardingJson === 'string') {
        parsedData = JSON.parse(agent.onboardingJson);
      }
      
      if (parsedData?.workflow && Array.isArray(parsedData.workflow)) {
        // Filter out deploy steps - they will be handled automatically
        const filteredSteps = parsedData.workflow.filter(step => step.step !== 'deploy');
        setWorkflowSteps(filteredSteps);
      } else {
        // If no workflow defined, just show empty (deploy will happen automatically)
        setWorkflowSteps([]);
      }
    } catch (error) {
      console.warn('Failed to parse onboardingJson:', error);
      setWorkflowSteps([]);
    }
  }, [agent.onboardingJson]);

  // Handle initial deployment
  const handleInitialDeploy = async () => {
    setIsDeploying(true);
    setDeploymentError(null);
    setIsConflict(false);
    
    try {
      // Call the deployment endpoint
      await apiClient.post('/api/client/templates/deploy', {
        agentName: agent.name
      });
      
      setDeploymentComplete(true);
    } catch (error) {
      console.error('Deployment failed:', error);
      
      // Check if it's a 409 conflict error
      if (error.response?.status === 409 || error.message?.includes('already exists')) {
        setIsConflict(true);
        setDeploymentError(error.message || 'Agent already exists');
      } else {
        setDeploymentError(error.message || 'Deployment failed');
      }
    } finally {
      setIsDeploying(false);
    }
  };

  // Handle deleting existing agent and retrying deployment
  const handleDeleteAndRedeploy = async () => {
    setIsDeleting(true);
    setDeploymentError(null);
    
    try {
      // Delete all schedules for the agent first
      try {
        await scheduleApi.deleteSchedulesByAgent(agent.name);
      } catch (scheduleError) {
        // Log the error but continue with agent deletion
        console.warn('Failed to delete schedules for agent, continuing with agent deletion:', scheduleError);
      }
      
      // Delete the existing agent
      await apiClient.delete(`/api/client/agents/${encodeURIComponent(agent.name)}`);
      
      // Wait a moment for the deletion to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Retry deployment
      setIsDeploying(true);
      setIsConflict(false);
      setIsDeleting(false);
      
      await apiClient.post('/api/client/templates/deploy', {
        agentName: agent.name
      });
      
      setDeploymentComplete(true);
    } catch (error) {
      console.error('Delete and redeploy failed:', error);
      setDeploymentError(error.message || 'Failed to delete and redeploy');
      setIsConflict(false);
    } finally {
      setIsDeploying(false);
      setIsDeleting(false);
    }
  };

  // Generate steps based on workflow
  const steps = workflowSteps.map((step, index) => ({
    label: step.name,
    description: step.description || `Complete ${step.step} step`,
    type: step.step,
    data: step,
    index: index
  }));

  const validateStep = (step) => {
    // No validation needed for workflow-based steps
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };


  const handleStepComplete = (stepIndex, result) => {
    setStepResults(prev => ({
      ...prev,
      [stepIndex]: result
    }));
    
    // Auto-advance to next step if successful
    if (result.success && activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleStepError = (error) => {
    console.error('Step error:', error);
  };

  const isAllStepsComplete = () => {
    // Check if all workflow steps are complete
    return workflowSteps.every((_, index) => 
      stepResults[index]?.success === true
    );
  };

  const renderStepContent = (stepIndex) => {
    const step = steps[stepIndex];
    
    // Handle workflow steps
    if (step.type === 'knowledge') {
      return (
        <KnowledgeStep
          stepData={step.data}
          agentName={agent.name}
          onComplete={(result) => handleStepComplete(stepIndex, result)}
          onError={handleStepError}
        />
      );
    }
    
    if (step.type === 'deploy') {
      return (
        <DeployStep
          stepData={step.data}
          agentName={agent.name}
          onComplete={(result) => handleStepComplete(stepIndex, result)}
          onError={handleStepError}
        />
      );
    }
    
    if (step.type === 'activate') {
      return (
        <ActivateStep
          stepData={step.data}
          agentName={agent.name}
          onComplete={(result) => handleStepComplete(stepIndex, result)}
          onError={handleStepError}
        />
      );
    }
    
    // Fallback for unknown step types
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="warning">
          Unknown step type: "{step.type}" (from step.data.step: "{step.data?.step}")
        </Alert>
      </Box>
    );
  };

  // Show initial deployment screen if not yet deployed
  if (!deploymentComplete && !isDeploying && !isDeleting && !deploymentError) {
    return (
      <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Deploy
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Agent: <strong>{agent.name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click the button below to deploy this agent to your environment.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleInitialDeploy}
            startIcon={<DeployIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            Deploy Agent
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </Box>
    );
  }

  // Show deployment progress if deploying or error
  if (isDeploying || isDeleting || deploymentError) {
    return (
      <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', textAlign: 'center', py: 4 }}>
        {(isDeploying || isDeleting) && (
          <>
            <CircularProgress size={64} sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {isDeleting ? 'Deleting Existing Agent...' : 'Deploying Agent...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isDeleting 
                ? `Removing existing "${agent.name}" before redeploying...`
                : `Please wait while we deploy "${agent.name}" to your environment.`
              }
            </Typography>
          </>
        )}
        
        {deploymentError && !isDeploying && !isDeleting && (
          <>
            <Alert severity={isConflict ? "warning" : "error"} sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                {isConflict ? 'Agent Already Exists' : 'Deployment Failed'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Agent <strong>'{agent.name}'</strong> already exists in your tenant.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Delete the existing agent to proceed with redeployment.
              </Typography>
            </Alert>
            
            {isConflict ? (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="warning"
                  onClick={handleDeleteAndRedeploy}
                >
                  Delete & Redeploy
                </Button>
                <Button variant="outlined" onClick={onCancel}>
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button variant="contained" onClick={onCancel}>
                Close
              </Button>
            )}
          </>
        )}
      </Box>
    );
  }

  // If deployment is complete but there are no workflow steps, show success
  if (deploymentComplete && workflowSteps.length === 0) {
    return (
      <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', textAlign: 'center', py: 4 }}>
        <SuccessIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, color: 'success.main' }}>
          Deployment Successful!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Agent "{agent.name}" has been successfully deployed and is ready to use.
        </Typography>
        <Button 
          variant="contained" 
          color="success" 
          onClick={() => {
            onCancel();
            navigate(`/manager/definitions/deployed${location.search}`);
          }}
        >
          View Deployed Agents
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Agent "{agent.name}" has been deployed successfully. Complete the configuration steps below.
          </Typography>
        </Alert>
      </Box>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {step.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </StepLabel>
            <StepContent>
              {renderStepContent(index)}
              
              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                {/* Show Complete button on last step if all steps are successful */}
                {index === steps.length - 1 && isAllStepsComplete() && (
                  <Button
                    variant="contained"
                    onClick={() => {
                      onCancel();
                      navigate(`/manager/definitions/deployed${location.search}`);
                    }}
                    color="success"
                    startIcon={<SuccessIcon />}
                  >
                    View Deployed Agents
                  </Button>
                )}
                
                {/* Always show back button for workflow steps (except first) */}
                {index > 0 && (
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                )}
                
                {/* Show navigation buttons only if step is complete or if it's a manual step */}
                {stepResults[index]?.success && index < steps.length - 1 && (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                )}
                
                <Button onClick={onCancel}>
                  Cancel
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default DeploymentWizard;
