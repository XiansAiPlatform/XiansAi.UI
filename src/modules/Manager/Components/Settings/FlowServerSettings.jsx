import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TextField
                label="Flow Server URL"
                value={settings?.flowServerUrl || 'Not configured'}
                fullWidth
                InputProps={{ 
                  readOnly: true,
                  className: 'readonly-input'
                }}
                className="app-server-url"
              />
              <Tooltip title="Copy URL">
                <IconButton 
                  onClick={() => handleCopy(settings?.flowServerUrl, 'Server URL')}
                  size="small"
                  disabled={!settings?.flowServerUrl}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              <Tooltip title="Copy Namespace">
                <IconButton 
                  onClick={() => handleCopy(settings?.flowServerNamespace, 'Namespace')}
                  size="small"
                  disabled={!settings?.flowServerNamespace}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box className="form-container">
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
              <TextField
                label="API Key"
                value={apiKey}
                fullWidth
                multiline
                rows={3}
                InputProps={{ readOnly: true }}
                className="input-field"
              />
              <Tooltip title="Copy API Key">
                <IconButton 
                  onClick={() => handleCopy(apiKey, 'API Key')}
                  size="small"
                  sx={{ mt: 1 }}
                  disabled={!apiKey}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
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