import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApi } from '../../services/api';
import './WorkflowList.css';

const NewWorkflowForm = ({ workflowType, onSuccess, onCancel }) => {
  const [parameters, setParameters] = useState([]); // Start with no parameters
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty parameters
      const filteredParams = parameters.filter(param => param.trim() !== '');
      await api.startNewWorkflow(workflowType, filteredParams);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = (index, value) => {
    const newParameters = [...parameters];
    newParameters[index] = value;
    setParameters(newParameters);
  };

  const addParameter = () => {
    setParameters([...parameters, '']);
  };

  const removeParameter = (index) => {
    const newParameters = parameters.filter((_, i) => i !== index);
    setParameters(newParameters);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Start New {workflowType.replace(/([A-Z])/g, ' $1').trim()}
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={addParameter}
          size="small"
          variant="outlined"
        >
          Inputs
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Refer to Flow Docs to know the inputs for this workflow
        </Typography>

        {parameters.map((parameter, index) => (
          <Paper
            key={index}
            elevation={0}
            className="parameter-paper"
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={parameter}
                onChange={(e) => handleParameterChange(index, e.target.value)}
                placeholder={`Input ${index + 1}`}
                sx={{ flex: 1 }}
              />
              <IconButton
                onClick={() => removeParameter(index)}
                size="small"
                className="delete-button"
              >
                <DeleteIcon />
              </IconButton>
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