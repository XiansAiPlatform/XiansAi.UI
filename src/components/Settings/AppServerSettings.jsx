import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Collapse,
  IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useApi } from '../../services/settings-api';
import { toast } from 'react-toastify';
import './Settings.css';
import { getConfig } from '../../config';



const AppServerSettings = () => {
  const [certName, setCertName] = useState('AppServerCert');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const api = useApi();
  const { apiBaseUrl } = getConfig();

  const exampleCode = `
// Example Flow Runner configuration
{
        var config = new Config
        {
            AppServerUrl = <app-server-url>,
            AppServerCertPath = <path-to-app-server-cert-downloaded-from-here>,
            AppServerCertPwd = <pwd-used-to-generate-certificate>,
            ... // other settings
        };

        FlowRunnerService runner = new FlowRunnerService(config);
}`;

  // Calculate number of lines in the example code
  const lineCount = exampleCode.split('\n').length;

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
        App Server
      </Typography>

      <Box className="code-container">
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
          <Typography variant="body2">
            View example Flow Runner configuration
          </Typography>
          <IconButton
            aria-label="toggle code example"
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
              className: 'readonly-code-input'
            }}
            className="code-example"
          />
        </Collapse>
      </Box>

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
            label="Password"
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