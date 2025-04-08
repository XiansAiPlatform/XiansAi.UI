import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box
} from '@mui/material';
import { useSettingsApi } from '../../services/settings-api';
import { toast } from 'react-toastify';
import './Settings.css';
import { getConfig } from '../../config';



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

  return (
    <Paper className="ca-certificates-paper">
      <Typography variant="h6" gutterBottom>
        App Server Configurations
      </Typography>

      <Box className="server-url-container">
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
    </Paper>
  );
};

export default AppServerSettings;