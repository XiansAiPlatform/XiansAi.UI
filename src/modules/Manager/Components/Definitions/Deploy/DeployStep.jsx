import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { 
  Rocket as DeployIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useApiClient } from '../../../services/api-client';
import { useNotification } from '../../../contexts/NotificationContext';

const DeployStep = ({ 
  stepData, 
  agentName,
  onComplete,
  onError 
}) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState(null);
  
  const apiClient = useApiClient();
  const { showSuccess, showError } = useNotification();

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      setDeploymentResult(null);

      // Call the deployment API endpoint
      const response = await apiClient.post('/api/client/templates/deploy', {
        agentName: agentName
      });

      setDeploymentResult({
        success: true,
        message: response.message || `Agent "${agentName}" deployed successfully`
      });

      showSuccess('Deployment completed successfully');

      // Notify parent that this step is complete
      if (onComplete) {
        onComplete({
          type: 'deploy',
          name: stepData.name,
          success: true,
          response: response
        });
      }
    } catch (error) {
      console.error('Deployment failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Deployment failed';
      
      setDeploymentResult({
        success: false,
        message: errorMessage
      });

      showError(`Deployment failed: ${errorMessage}`);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>

          {!deploymentResult && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  This will deploy the agent "{agentName}" to your environment. 
                  The deployment process will set up all necessary resources and configurations.
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isDeploying ? <CircularProgress size={20} /> : <DeployIcon />}
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {isDeploying ? 'Deploying...' : 'Deploy Agent'}
                </Button>
              </Box>
            </>
          )}

          {deploymentResult && (
            <Box sx={{ textAlign: 'center' }}>
              {deploymentResult.success ? (
                <>
                  <Alert 
                    severity="success" 
                    sx={{ mb: 3 }}
                    icon={<SuccessIcon />}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Deployment Successful!
                    </Typography>
                    <Typography variant="body2">
                      {deploymentResult.message}
                    </Typography>
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    The agent has been successfully deployed and is ready to use.
                  </Typography>
                </>
              ) : (
                <>
                  <Alert 
                    severity="error" 
                    sx={{ mb: 3 }}
                    icon={<ErrorIcon />}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Deployment Failed
                    </Typography>
                    <Typography variant="body2">
                      {deploymentResult.message}
                    </Typography>
                  </Alert>
                  <Button
                    variant="contained"
                    startIcon={<DeployIcon />}
                    onClick={handleDeploy}
                    sx={{ mt: 2 }}
                  >
                    Retry Deployment
                  </Button>
                </>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeployStep;
