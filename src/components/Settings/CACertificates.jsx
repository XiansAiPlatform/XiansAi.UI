import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Alert
} from '@mui/material';
import { useApi } from '../../services/api';
import { toast } from 'react-toastify';

const CACertificates = () => {
  const [certName, setCertName] = useState('Flowmaxer');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const api = useApi();

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
      link.setAttribute('download', `${certName}.pfx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Clear form
      setCertName('');
      setPassword('');
      toast.success('Certificate generated and downloaded successfully');
    } catch (error) {
      toast.error(`Failed to generate certificate: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        CA Certificates
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Generate and download certificates for Flow workers. 
        Make sure to safely store the certificate password.
        <br />
        This certificate is used to run your Flows on the Flow Worker. 
        Configure the certificate path and password in the Flow Worker settings.
      </Alert>

      <Box component="form" sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <TextField
            label="Certificate Name"
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            size="medium"
            required
            sx={{ flex: 1, minWidth: '250px' }}
          />
          
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="medium"
            required
            sx={{ flex: 1, minWidth: '250px' }}
          />
        </Box>

        <Button
          variant="contained"
          onClick={downloadCertificate}
          disabled={isLoading || !certName || !password}
          sx={{ mt: 1, alignSelf: 'flex-end' }}
        >
          {isLoading ? 'Generating...' : 'Generate & Download Certificate'}
        </Button>
      </Box>
    </Paper>
  );
};

export default CACertificates;
