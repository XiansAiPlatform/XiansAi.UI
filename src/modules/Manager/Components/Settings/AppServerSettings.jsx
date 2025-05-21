import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSettingsApi } from '../../services/settings-api';
import { toast } from 'react-toastify';
import './Settings.css';
import { getConfig } from '../../../../config';

const AppServerSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const api = useSettingsApi();
  const { apiBaseUrl } = getConfig();
  const [apiKey, setApiKey] = useState('');

  const generateApiKey = async () => {
    setIsLoading(true);
    try {
      const response = await api.generateApiKey();
      console.log(response);
      setApiKey(response.certificate);
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
        App Server Configurations
      </Typography>

      <Box className="server-url-container">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TextField
            label="App Server URL"
            value={apiBaseUrl}
            fullWidth
            InputProps={{ 
              readOnly: true,
              className: 'readonly-input'
            }}
            className="app-server-url"
          />
          <Tooltip title="Copy URL">
            <IconButton 
              onClick={() => handleCopy(apiBaseUrl, 'Server URL')}
              size="small"
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
            <span>
              <IconButton 
                onClick={() => handleCopy(apiKey, 'API Key')}
                size="small"
                sx={{ mt: 1 }}
                disabled={!apiKey}
              >
                <ContentCopyIcon />
              </IconButton>
            </span>
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
    </Paper>
  );
};

export default AppServerSettings;