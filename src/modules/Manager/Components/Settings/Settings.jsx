import { useState } from 'react';
import { Box, Typography, Container, Alert, Tabs, Tab } from '@mui/material';
import CACertificates from './AppServerSettings';
import BrandingSettings from './BrandingSettings';
import ApiKeySettings from './ApiKeySettings';
import './Settings.css';
import { useTenant } from '../../contexts/TenantContext'; 
import ApproveUserRequests from "./ApproveUserRequests";
import InviteUser from "./InviteUser";
import TenantUserManagement from "./TenantUserManagement";

const Settings = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const { userRoles } = useTenant();
  const showTenantTab = userRoles.includes('SysAdmin') || userRoles.includes('TenantAdmin');

  // Build tabs and panels dynamically so indices always match
  const tabs = [
    { label: 'App Server', component: <CACertificates /> },
  ];
  if (showTenantTab) {
    tabs.splice(1, 0, { label: "Users", component: <TenantUserManagement /> });
    tabs.splice(2, 0, {
      label: "Approve Requests",
      component: <ApproveUserRequests />,
    });
    tabs.splice(3, 0, { label: "User invitations", component: <InviteUser /> });
    tabs.splice(4, 0, { label: "Branding", component: <BrandingSettings /> });
    tabs.splice(5, 0, { label: "API Keys", component: <ApiKeySettings /> });
  }

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
            {tabs.map((tab, idx) => (
              <Tab key={tab.label} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        <Box role="tabpanel">
          {tabs[currentTab]?.component}
        </Box>
      </Box>
    </Container>
  );
};

export default Settings;