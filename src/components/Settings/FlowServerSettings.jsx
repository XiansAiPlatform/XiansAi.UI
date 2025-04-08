import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  CircularProgress
} from '@mui/material';
import { useSettingsApi } from '../../services/settings-api';
import { toast } from 'react-toastify';
import './Settings.css';

const FlowServerSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const api = useSettingsApi();

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const fetchSettings = async () => {
    try {
      const flowServerSettings = await api.getFlowServerSettings();
      console.log('flowServerSettings', flowServerSettings);
      setSettings(flowServerSettings);
    } catch (error) {
      toast.error('Failed to fetch Flow Server settings');
      console.error('Error fetching settings:', error);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const generateApiKey = async () => {
    setIsLoading(true);
    try {
      const response = await api.getFlowServerApiKey();
      setApiKey(response.apiKey);
      toast.success('API Key generated successfully');
    } catch (error) {
      toast.error(`Failed to generate API key: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper className="ca-certificates-paper">
      <Typography variant="h6" gutterBottom>
        Flow Server Configurations
      </Typography>

      {isSettingsLoading ? (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box className="server-url-container" sx={{ mb: 3 }}>
            <TextField
              label="Flow Server URL"
              value={settings?.flowServerUrl || 'Not configured'}
              fullWidth
              InputProps={{ 
                readOnly: true,
                className: 'readonly-input'
              }}
              className="app-server-url"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Flow Server Namespace"
              value={settings?.flowServerNamespace || 'Not configured'}
              fullWidth
              InputProps={{ 
                readOnly: true,
                className: 'readonly-input'
              }}
              className="app-server-url"
            />
          </Box>

          <Box className="form-container">
            <TextField
              label="API Key"
              value={apiKey}
              fullWidth
              multiline
              rows={3}
              InputProps={{ readOnly: true }}
              className="input-field"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={generateApiKey}
              disabled={isLoading}
              className="submit-button"
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            >
              {isLoading ? 'Generating...' : 'Generate New API Key'}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default FlowServerSettings; 