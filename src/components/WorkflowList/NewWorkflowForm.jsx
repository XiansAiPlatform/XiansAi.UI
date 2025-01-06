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
} from '@mui/material';
import { useApi } from '../../services/workflow-api';
import './WorkflowList.css';

const NewWorkflowForm = ({ workflowType, parameterInfo, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [parameters, setParameters] = useState(
    parameterInfo ? 
      Object.fromEntries(parameterInfo.map(param => [param.name, ''])) : 
      {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parameterValues = parameterInfo 
        ? parameterInfo.map(param => parameters[param.name])
        : [];
      await api.startNewWorkflow(workflowType, parameterValues);
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Start New {workflowType.replace(/([A-Z])/g, ' $1').trim()}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        {parameterInfo && parameterInfo.map((param, index) => (
          <Paper
            key={param.name}
            elevation={0}
            className="parameter-paper"
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={parameters[param.name]}
                onChange={(e) => handleParameterChange(param.name, e.target.value)}
                placeholder={param.name}
                label={`${param.name} (${param.type})`}
                sx={{ flex: 1 }}
              />
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Start Workflow
        </Button>
      </Box>
    </Box>
  );
};

export default NewWorkflowForm; 