import React from 'react';
import { Box, Typography, Container, Alert } from '@mui/material';
import CACertificates from './AppServerSettings';
import FlowServerSettings from './FlowServerSettings';
import './Settings.css';

const Settings = () => {
  return (
    <Container maxWidth="lg">
      <Box className="settings-container">
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
              
        <Alert severity="info" className="info-alert">
          These settings are required for your flow server to run.
          <br />
          Configure the certificate and key paths in the Flow Runner settings.
          <br />
          See the example below.
        </Alert>
        <CACertificates />
        <FlowServerSettings />
      </Box>
    </Container>
  );
};

export default Settings; 