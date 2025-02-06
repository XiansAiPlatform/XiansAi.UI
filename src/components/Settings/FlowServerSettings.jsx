import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useApi } from '../../services/settings-api';
import { toast } from 'react-toastify';
import './Settings.css';

const FlowServerSettings = () => {
  const [certName, setCertName] = useState('FlowServerCert');
  const [keyName, setKeyName] = useState('FlowServerPrivateKey');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const api = useApi();

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

  const generateNewFiles = async () => {
    if (!certName || !keyName) {
      toast.error('Please provide both certificate and key names');
      return;
    }

    setIsLoading(true);
    try {
      // Generate certificate with password
      const certResponse = await api.getFlowServerCertFile(certName);  // Empty password for now
      downloadBlob(certResponse, `${certName}-${Date.now()}.crt`, 'application/x-x509-ca-cert');

      // Generate key
      const keyResponse = await api.getFlowServerPrivateKeyFile(keyName);
      downloadBlob(keyResponse, `${keyName}-${Date.now()}.key`, 'application/x-pem-file');

      toast.success('Certificate and key generated successfully');
      await fetchSettings(); // Refresh settings after generating new files
      
    } catch (error) {
      toast.error(`Failed to generate files: ${error.message}`);
    } finally {
      setIsLoading(false);
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

  const downloadBlob = (data, filename, type) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="With API Keys" />
              <Tab label="With Certificates" />
            </Tabs>
          </Box>

          {activeTab === 0 ? (
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
          ) : (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Download Certificates
              </Typography>

              <Box component="form" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    label="Certificate Name"
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    fullWidth
                    required
                    disabled={isLoading}
                    className="input-field"
                  />
                  
                  <TextField
                    label="Private Key Name"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    fullWidth
                    required
                    disabled={isLoading}
                    className="input-field"
                  />
                </Box>

                <Button
                  variant="contained"
                  onClick={generateNewFiles}
                  disabled={isLoading || !certName || !keyName}
                  className="submit-button"
                >
                  {isLoading ? 'Generating...' : 'Download Files'}
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default FlowServerSettings; 