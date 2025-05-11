import React, { useState } from 'react';
import { Box, Typography, Container, Alert, Tabs, Tab } from '@mui/material';
import CACertificates from './AppServerSettings';
import FlowServerSettings from './FlowServerSettings';
import './Settings.css';

const Settings = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box className="settings-container">
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 'var(--font-weight-semibold)',
            letterSpacing: 'var(--letter-spacing-tight)',
            color: 'var(--text-primary)',
            mb: 4
          }}
        >
          Settings
        </Typography>
        <Alert severity="info" className="info-alert">
          These settings are required for your flow server to run.
          <br />
          Configure the certificate and key paths in the Flow Runner settings.
        </Alert>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            aria-label="settings tabs"
          >
            <Tab label="App Server" />
            <Tab label="Flow Server" />
          </Tabs>
        </Box>

        <Box role="tabpanel">
          {currentTab === 0 && <CACertificates />}
          {currentTab === 1 && <FlowServerSettings />}
        </Box>
      </Box>
    </Container>
  );
};

export default Settings; 