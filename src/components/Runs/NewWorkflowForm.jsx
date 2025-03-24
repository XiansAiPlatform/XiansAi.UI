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
import { useApi } from '../../services/workflow-api';
import './WorkflowList.css';

const NewWorkflowForm = ({ definition, onSuccess, onCancel, isMobile }) => {
  const navigate = useNavigate();
  const [parameters, setParameters] = useState(
    definition && definition.parameters ? 
      Object.fromEntries(definition.parameters.map(param => [param.name, ''])) : 
      {}
  );
  const [runType, setRunType] = useState('unique'); // 'unique' or 'singleton'
  const [flowId, setFlowId] = useState(definition ? `${definition.agentName}:${definition.typeName}` : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parameterValues = definition && definition.parameters 
        ? definition.parameters.map(param => parameters[param.name])
        : [];
      
      const flowIdToSend = runType === 'singleton' ? flowId : null;
      
      await api.startNewWorkflow(
        definition.typeName, 
        definition.agentName, 
        parameterValues,
        flowIdToSend
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

      <Box sx={{ mb: 3 }}>
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
            <TextField
              fullWidth
              required
              error={runType === 'singleton' && !flowId}
              helperText={runType === 'singleton' && !flowId ? "Flow ID is required" : ""}
              value={flowId}
              onChange={(e) => setFlowId(e.target.value)}
              label="Flow ID"
              placeholder="Enter custom Flow ID"
              size={isMobile ? "small" : "medium"}
            />
          </Paper>
        )}
      </Box>

      <Typography variant={isMobile ? "h7" : "h6"} sx={{ pr: isMobile ? 4 : 0, mb: 2 }}>
        Input Parameters
      </Typography>

      <Box sx={{ 
        mb: 3, 
        flex: 1,
        overflowY: 'auto'
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
          disabled={loading || (runType === 'singleton' && !flowId)}
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