import { useState } from 'react';
import { Box, Typography, Container, Alert, Tabs, Tab } from '@mui/material';
import CACertificates from './AppServerSettings';
import TenantSettings from './TenantSettings';
import BrandingSettings from './BrandingSettings';
import ApiKeySettings from './ApiKeySettings';
import './Settings.css';
import { useTenant } from '../../contexts/TenantContext'; 

const Settings = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const { userRoles } = useTenant();
  const showTenantTab = userRoles.includes('SysAdmin') || userRoles.includes('TenantAdmin');
  const showApiKeyTab = showTenantTab; // Only show API Keys tab for SysAdmin/TenantAdmin

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
          These settings are required for your app server to run.
          <br />
          Configure the certificate and key paths in the App Server settings.
        </Alert>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            aria-label="settings tabs"
          >
            <Tab label="App Server" />
            {showTenantTab && <Tab label="Tenant" />}
            {showTenantTab && <Tab label="Branding" />}
            { <Tab label="API Keys" />}
          </Tabs>
        </Box>

        <Box role="tabpanel">
          {currentTab === 0 && <CACertificates />}
          {currentTab === 1 && <ApiKeySettings />}
          {showTenantTab && currentTab === 2 && <TenantSettings />}
          {showTenantTab && currentTab === 3 && <BrandingSettings />}
          
        </Box>
      </Box>
    </Container>
  );
};

export default Settings;