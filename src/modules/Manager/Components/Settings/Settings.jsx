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
import TenantAuthSettings from './TenantAuthSettings';

const Settings = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentUserSubTab, setCurrentUserSubTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleUserSubTabChange = (event, newValue) => {
    setCurrentUserSubTab(newValue);
  };

  const { userRoles } = useTenant();
  const showTenantTab = userRoles.includes('SysAdmin') || userRoles.includes('TenantAdmin');

  // Build main tabs
  const tabs = [
    { label: 'Agent Settings', component: <CACertificates /> },
  ];
  
  if (showTenantTab) {
    tabs.push({ label: "Users", component: null }); // Will be handled by sub-tabs
    tabs.push({ label: "Branding", component: <BrandingSettings /> });
    tabs.push({ label: "API Keys", component: <ApiKeySettings /> });
    tabs.push({ label: "Auth Config", component: <TenantAuthSettings /> });
  }

  // Sub-tabs for Users section
  const userSubTabs = [
    { label: "User Management", component: <TenantUserManagement /> },
    { label: "Invite Users", component: <InviteUser /> },
    { label: "Approve Requests", component: <ApproveUserRequests /> }

  ];

  // Check if current tab is the Users tab
  const isUsersTab = showTenantTab && currentTab === 1;

  const renderTabContent = () => {
    if (isUsersTab) {
      return (
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={currentUserSubTab} 
              onChange={handleUserSubTabChange}
              aria-label="user management sub-tabs"
            >
              {userSubTabs.map((tab, idx) => (
                <Tab key={tab.label} label={tab.label} />
              ))}
            </Tabs>
          </Box>
          <Box role="tabpanel">
            {userSubTabs[currentUserSubTab]?.component}
          </Box>
        </Box>
      );
    } else {
      return tabs[currentTab]?.component;
    }
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
          Tenant Settings
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
          {renderTabContent()}
        </Box>
      </Box>
    </Container>
  );
};

export default Settings;