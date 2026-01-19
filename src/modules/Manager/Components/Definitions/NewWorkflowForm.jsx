import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useWorkflowApi } from '../../services/workflow-api';
import './Definitions.css';

const NewWorkflowForm = ({ definition, onSuccess, onCancel, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [parameters, setParameters] = useState(
    definition && definition.parameterDefinitions ? 
      Object.fromEntries(definition.parameterDefinitions.map(param => [param.name, ''])) : 
      {}
  );
  const [workflowId, setWorkflowId] = useState('');
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
      
      const flowIdToSend = workflowId || null;
      const queueNameToSend = queueType === 'named' ? queueName : null;
      
      await api.startNewWorkflow(
        definition.workflowType.trim(), 
        definition.agent.trim(), 
        parameterValues,
        flowIdToSend,
        queueNameToSend
      );
      onSuccess();
      // Preserve URL search params (like org=...) when navigating
      navigate(`/manager/runs${location.search}`, { state: { fromNewWorkflow: true } });
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

  const handleWorkflowIdChange = (e) => {
    setWorkflowId(e.target.value);
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
          sx={{ 
            mb: 2,
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            color: '#d32f2f',
            '& .MuiAlert-icon': {
              color: '#f44336'
            }
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
              sx={{ color: '#d32f2f' }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Workflow Summary */}
      {definition.summary && (
        <Box sx={{ mb: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 1.5 : 2,
              backgroundColor: '#f5f9ff',
              border: '1px solid #d1e3ff'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <InfoOutlinedIcon sx={{ color: 'primary.main', mt: 0.5, fontSize: '20px' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: 'primary.main' }}>
                  Workflow Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {definition.summary}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                    {param.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    ({param.type})
                  </Typography>
                  {param.optional && (
                    <Chip 
                      label="Optional" 
                      size="small" 
                      variant="outlined"
                      color="default"
                      sx={{ 
                        height: '20px',
                        fontSize: '0.7rem',
                        borderColor: '#9e9e9e',
                        color: '#666'
                      }}
                    />
                  )}
                  {!param.optional && (
                    <Chip 
                      label="Required" 
                      size="small" 
                      color="error"
                      variant="outlined"
                      sx={{ 
                        height: '20px',
                        fontSize: '0.7rem'
                      }}
                    />
                  )}
                </Box>
                {param.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    {param.description}
                  </Typography>
                )}
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 3 : 2}
                  value={parameters[param.name] || ''}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  placeholder={`Enter ${param.name.toLowerCase()}${param.optional ? ' (optional)' : ''}`}
                  size={isMobile ? "small" : "medium"}
                  required={!param.optional}
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
          Workflow Identity
        </Typography>
        
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
              Workflow ID Postfix (Optional)
            </Typography>
            <TextField
              fullWidth
              value={workflowId}
              onChange={handleWorkflowIdChange}
              placeholder="Optional postfix"
              size={isMobile ? "small" : "medium"}
              helperText="Leave empty for singleton run, or provide a custom identifier postfix"
            />
          </Box>
        </Paper>
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
          disabled={loading || (queueType === 'named' && !queueName)}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Start Workflow
        </Button>
      </Box>
    </Box>
  );
};

export default NewWorkflowForm; 
