import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useWorkflowApi } from '../../services/workflow-api';
import './Definitions.css';
import { useSelectedOrg } from '../../contexts/OrganizationContext';

const NewWorkflowForm = ({ definition, onSuccess, onCancel, isMobile }) => {
  const navigate = useNavigate();
  const { selectedOrg } = useSelectedOrg();
  const tenantPrefix = `${selectedOrg}:`;
  
  const [parameters, setParameters] = useState(
    definition && definition.parameterDefinitions ? 
      Object.fromEntries(definition.parameterDefinitions.map(param => [param.name, ''])) : 
      {}
  );
  const [runType, setRunType] = useState('singleton'); // 'unique' or 'singleton'
  const [flowId, setFlowId] = useState(definition.workflowType.trim());
  const [queueType] = useState('default'); // 'default' or 'named'
  const [queueName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useWorkflowApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert parameters object to array in the order of parameterDefinitions
      const parameterValues = definition && definition.parameterDefinitions 
        ? definition.parameterDefinitions.map(param => parameters[param.name])
        : [];
      
      const flowIdToSend = runType === 'singleton' ? `${tenantPrefix}${flowId}` : null;
      const queueNameToSend = queueType === 'named' ? queueName : null;
      
      await api.startNewWorkflow(
        definition.workflowType.trim(), 
        definition.agent.trim(), 
        parameterValues,
        flowIdToSend,
        queueNameToSend
      );
      onSuccess();
      navigate('/runs');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleRunTypeChange = (event) => {
    setRunType(event.target.value);
  };

  // const handleQueueTypeChange = (event) => {
  //   setQueueType(event.target.value);
  // };

  const handleFlowIdChange = (e) => {
    setFlowId(e.target.value);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      p: isMobile ? 2 : 3
    }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? "h7" : "h6"} sx={{ mb: 2 }}>
          Input Parameters
        </Typography>
        {definition.parameterDefinitions && definition.parameterDefinitions.length > 0 ? (
          definition.parameterDefinitions.map((param) => (
            <Paper
              key={param.name}
              elevation={0}
              className="parameter-paper"
              sx={{
                p: isMobile ? 1.5 : 2,
                mb: 2
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {param.name} ({param.type})
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 3 : 2}
                  value={parameters[param.name] || ''}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  placeholder={`Enter ${param.name.toLowerCase()}`}
                  size={isMobile ? "small" : "medium"}
                />
              </Box>
            </Paper>
          ))
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ p: 2, textAlign: 'left' }}>
            No input parameters required for this workflow.
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant={isMobile ? "h7" : "h6"} sx={{ mb: 1 }}>
          Flow Identity
        </Typography>
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            row
            value={runType}
            onChange={handleRunTypeChange}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, mr: 2 }}>
              <FormControlLabel 
                value="singleton" 
                control={<Radio />} 
                label="Named Singleton Run" 
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                Using a custom Flow ID. Only one run with this ID can exist at a time.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <FormControlLabel 
                value="unique" 
                control={<Radio />} 
                label="New Unique Run" 
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                A unique flow ID will be generated for this run. Multiple runs can co-exist.
              </Typography>
            </Box>
          </RadioGroup>
        </FormControl>
        
        {runType === 'singleton' && (
          <Paper
            elevation={0}
            className="parameter-paper"
            sx={{
              p: isMobile ? 1.5 : 2,
              mt: 2
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Flow ID
              </Typography>
              <TextField
                fullWidth
                value={flowId}
                onChange={handleFlowIdChange}
                placeholder="Enter custom Flow ID (no spaces allowed)"
                size={isMobile ? "small" : "medium"}
                helperText="Tenant prefix will be automatically added"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ 
                      color: 'text.secondary',
                      bgcolor: 'action.hover',
                      px: 1,
                      py: 0.5,
                      borderRadius: '4px',
                      mr: 1
                    }}>
                      {tenantPrefix}
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                This ID will be used to identify and manage the workflow instance
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          color="primary"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || (runType === 'singleton' && !flowId) || (queueType === 'named' && !queueName)}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Start Workflow
        </Button>
      </Box>
    </Box>
  );
};

export default NewWorkflowForm; 