import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box
} from '@mui/material';
import { useApi } from '../../services/settings-api';
import { toast } from 'react-toastify';
import './Settings.css';
import { getConfig } from '../../config';



const AppServerSettings = () => {
  const [certName, setCertName] = useState('AppServerCert');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const api = useApi();
  const { apiBaseUrl } = getConfig();

  const downloadCertificate = async () => {
    if (!certName || !password) {
      toast.error('Please provide both certificate name and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.generateCertificate(certName, password);
      
      // Create a blob from the response and download it
      const blob = new Blob([response], { type: 'application/x-pkcs12' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certName}-${Date.now()}.pfx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setPassword('');
      toast.success('Certificate generated and downloaded successfully');
    } catch (error) {
      toast.error(`Failed to generate certificate: ${error.message}`);
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

      <Box component="form" className="form-container">
        <Box className="input-row">
          <TextField
            label="Certificate FileName"
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            size="medium"
            required
            className="input-field"
          />
          
          <TextField
            label="Select a Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="medium"
            required
            className="input-field"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={downloadCertificate}
            disabled={isLoading || !certName || !password}
            className="submit-button"
          >
            {isLoading ? 'Generating...' : 'Generate & Download Certificate'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AppServerSettings;