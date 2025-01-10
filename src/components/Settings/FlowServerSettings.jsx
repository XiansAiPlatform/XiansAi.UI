import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Collapse,
  IconButton,
  CircularProgress
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useApi } from '../../services/settings-api';
import { toast } from 'react-toastify';
import './Settings.css';

const FlowServerSettings = () => {
  const [certName, setCertName] = useState('FlowServerCert');
  const [keyName, setKeyName] = useState('FlowServerPrivateKey');
  const [isLoading, setIsLoading] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
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

  const exampleCode = `
// Example Flow Runner configuration
{
    var config = new Config
    {
        FlowServerUrl = "${settings?.flowServerUrl || '<flow-server-url>'}",
        FlowServerNamespace = "${settings?.namespace || '<namespace>'}",
        FlowServerCertPath = "<path-to-flow-server-cert>",
        FlowServerPrivateKeyPath = "<path-to-flow-server-key>",
        ... // other settings
    };

    FlowRunnerService runner = new FlowRunnerService(config);
}`;

  const lineCount = exampleCode.split('\n').length;

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

          <Box className="code-container" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">
              View example Flow Runner configurations
              </Typography>
              <IconButton
                onClick={() => setShowExample(!showExample)}
                size="small"
              >
                {showExample ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={showExample}>
              <TextField
                multiline
                rows={lineCount}
                fullWidth
                variant="outlined"
                value={exampleCode}
                InputProps={{ 
                  readOnly: true,
                  sx: { fontFamily: 'monospace' }
                }}
              />
            </Collapse>
          </Box>

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
        </>
      )}
    </Paper>
  );
};

export default FlowServerSettings; 