import React, { useState } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { useApiClient } from '../services/api-client';

const ErrorTest = () => {
  const [error, setError] = useState(null);
  const apiClient = useApiClient();

  const simulateError = async () => {
    try {
      // This will trigger the error handling with the specific format
      const mockErrorResponse = new Response(JSON.stringify({
        type: "https://tools.ietf.org/html/rfc9110#section-15.6.1",
        title: "Workflow Start Failed",
        status: 500,
        detail: "Workflow execution is already running. WorkflowId: 99xio:NotelessAgent:DrugInfoBot, RunId: 01967af7-95f2-7c2f-908c-b1d7d3cd0ee4."
      }), {
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      });
      
      // This will trigger our error handler
      throw mockErrorResponse;
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Error Handling Test
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          This component demonstrates how the application handles the specific error format:
        </Typography>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          {`{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.6.1",
  "title": "Workflow Start Failed",
  "status": 500,
  "detail": "Workflow execution is already running. WorkflowId: 99xio:NotelessAgent:DrugInfoBot, RunId: 01967af7-95f2-7c2f-908c-b1d7d3cd0ee4."
}`}
        </pre>
      </Paper>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={simulateError}
        sx={{ mb: 3 }}
      >
        Simulate Error
      </Button>
      
      {error && (
        <Paper sx={{ p: 3, bgcolor: '#fff8f8' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error Details
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Title:</strong> {error.title}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Description:</strong> {error.description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Technical Details:</strong> {error.technical}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ErrorTest; 