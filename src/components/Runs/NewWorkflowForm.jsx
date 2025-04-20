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
  FormControl
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useWorkflowApi } from '../../services/workflow-api';
import './WorkflowList.css';
import { useSelectedOrg } from '../../contexts/OrganizationContext';

const NewWorkflowForm = ({ definition, onSuccess, onCancel, isMobile }) => {
  const navigate = useNavigate();
  const { selectedOrg } = useSelectedOrg();
  const [parameters, setParameters] = useState(
    definition && definition.parameters ? 
      Object.fromEntries(definition.parameters.map(param => [param.name, ''])) : 
      {}
  );
  const [runType, setRunType] = useState('unique'); // 'unique' or 'singleton'
  const [flowId, setFlowId] = useState(definition ? `${definition.agentName.replaceAll(' ', '')}:${definition.typeName.replaceAll(' ', '')}` : '');
  const [queueType, setQueueType] = useState('default'); // 'default' or 'named'
  const [queueName, setQueueName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useWorkflowApi();
  const tenantPrefix = `${selectedOrg}:`; // Using the actual tenant ID from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parameterValues = definition && definition.parameters 
        ? definition.parameters.map(param => parameters[param.name])
        : [];
      
      const flowIdToSend = runType === 'singleton' ? flowId : null;
      const queueNameToSend = queueType === 'named' ? queueName : null;
      
      await api.startNewWorkflow(
        definition.typeName, 
        definition.agentName, 
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

  const handleQueueTypeChange = (event) => {
    setQueueType(event.target.value);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ 
      p: isMobile ? 2 : 3,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        position: 'relative'
      }}>
        
        {isMobile && (
          <IconButton 
            aria-label="close" 
            onClick={onCancel}
            sx={{ 
              position: 'absolute',
              right: -8,
              top: -8
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant={isMobile ? "h7" : "h6"} sx={{ pr: isMobile ? 4 : 0, mb: 2 }}>
        Input Parameters
      </Typography>

      <Box sx={{ 
        mb: 2
      }}>
        {definition.parameters && definition.parameters.length > 0 ? (
          definition.parameters.map((param, index) => (
            <Paper
              key={param.name}
              elevation={0}
              className="parameter-paper"
              sx={{
                p: isMobile ? 1.5 : 2,
                mb: 2
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 3 : 2}
                  value={parameters[param.name]}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  placeholder={param.name}
                  label={`${param.name} (${param.type})`}
                  sx={{ flex: 1 }}
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
          Priority Queue
        </Typography>
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            aria-label="queue-type"
            name="queue-type"
            value={queueType}
            onChange={handleQueueTypeChange}
            row
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, mr: 2 }}>
              <FormControlLabel 
                value="default" 
                control={<Radio />} 
                label="Default Queue" 
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5, mb: 1, ml: 4 }}>
                Uses the default priority queue for this workflow.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <FormControlLabel 
                value="named" 
                control={<Radio />} 
                label="Named Queue" 
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5, mb: 1, ml: 4 }}>
                Specify a custom priority queue name for this workflow.
              </Typography>
            </Box>
          </RadioGroup>
        </FormControl>
        
        {queueType === 'named' && (
          <Paper
            elevation={0}
            className="parameter-paper"
            sx={{
              p: isMobile ? 1.5 : 2,
              mt: 2,
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Priority Queue Name
              </Typography>
              <TextField
                fullWidth
                required
                error={queueType === 'named' && !queueName}
                value={queueName}
                onChange={(e) => setQueueName(e.target.value)}
                placeholder="Enter queue name"
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <Box sx={{ 
                mt: 1,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: 'rgba(255, 152, 0, 0.08)',
                border: '1px solid',
                borderColor: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{ fontSize: '16px', pl: 0.5 }}>⚠️</Box>
                <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 500, pl: 1 }}>
                  Ensure workflow runners are configured to handle this custom queue name before proceeding.
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant={isMobile ? "h7" : "h6"} sx={{ mb: 1 }}>
          Flow Identity
        </Typography>
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            aria-label="run-type"
            name="run-type"
            value={runType}
            onChange={handleRunTypeChange}
            row
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, mr: 2 }}>
              <FormControlLabel 
                value="unique" 
                control={<Radio />} 
                label="New Unique Run" 
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5, mb: 1, ml: 4 }}>
                A unique flow id will be generated for this flow run. This allows multiple runs to co-exist.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <FormControlLabel 
                value="singleton" 
                control={<Radio />} 
                label="Named Singleton Run" 
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5, mb: 1, ml: 4 }}>
                Using a custom Flow ID. Only one run with this ID can exist at a time.
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
              mt: 2,
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Flow ID (with server prefix)
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'stretch', 
                  width: '100%',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  '&:hover': {
                    border: '1px solid rgba(0, 0, 0, 0.87)'
                  },
                  '&:focus-within': {
                    border: '2px solid #1976d2',
                    padding: '0px'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: 'action.hover', 
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                    typography: 'body2',
                    fontWeight: 'medium',
                    whiteSpace: 'nowrap',
                    height: isMobile ? '40px' : '56px',
                    boxSizing: 'border-box',
                    borderRight: '1px solid rgba(0, 0, 0, 0.23)'
                  }}
                >
                  {tenantPrefix}
                </Box>
                <TextField
                  fullWidth
                  required
                  error={runType === 'singleton' && !flowId}
                  value={flowId}
                  onChange={(e) => setFlowId(e.target.value)}
                  placeholder="Enter custom Flow ID"
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    sx: { 
                      border: 'none',
                      '&:before': {
                        display: 'none'
                      },
                      '&:after': {
                        display: 'none'
                      }
                    }
                  }}
                  sx={{ 
                    flex: 1,
                    fieldset: {
                      border: 'none'
                    }
                  }}
                  variant="outlined"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                The server will automatically add "{tenantPrefix}" as a prefix to your Flow ID
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>

      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        justifyContent: 'flex-end',
        mt: 'auto',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {!isMobile && (
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={loading || 
            (runType === 'singleton' && !flowId) || 
            (queueType === 'named' && !queueName)}
          fullWidth={isMobile}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Start Workflow
        </Button>
      </Box>
    </Box>
  );
};

export default NewWorkflowForm; 