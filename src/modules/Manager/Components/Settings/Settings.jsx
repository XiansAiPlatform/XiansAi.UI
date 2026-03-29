import { useState } from 'react';
import { Box, Alert, Tabs, Tab } from '@mui/material';
import CACertificates from './AppServerSettings';
import BrandingSettings from './BrandingSettings';
import ApiKeySettings from './ApiKeySettings';
import './Settings.css';
import { useTenant } from '../../contexts/TenantContext';
import TenantUserManagement from "./TenantUserManagement";
import ApproveUserRequests from "./ApproveUserRequests";
import TenantAuthSettings from './TenantAuthSettings';
import PageLayout from '../Common/PageLayout';

const Settings = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentUserSubTab, setCurrentUserSubTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleUserSubTabChange = (event, newValue) => {
    setCurrentUserSubTab(newValue);
  };

  const { isAdmin } = useTenant();
  const showTenantTab = isAdmin;

  // Build main tabs
  const tabs = [
    { label: 'Agent Settings', component: <CACertificates /> },
  ];
  
  if (showTenantTab) {

    tabs.push({ label: "API Keys", component: <ApiKeySettings /> });
    tabs.push({ label: "Open ID Connect", component: <TenantAuthSettings /> });
    tabs.push({ label: "Tenant Users", component: null }); // Sub-tabs: management + approve requests
    tabs.push({ label: "Branding", component: <BrandingSettings /> });
  }

  const userSubTabs = [
    { label: "User Management", component: <TenantUserManagement /> },
    { label: "Approve Requests", component: <ApproveUserRequests /> },
  ];

  // Check if current tab is the Users tab
  const isUsersTab = showTenantTab && currentTab === 3;

  const renderTabContent = () => {
    if (isUsersTab) {
      return (
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={currentUserSubTab}
              onChange={handleUserSubTabChange}
              aria-label="user management sub-tabs"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 300,
                  minWidth: 120,
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 200,
                  },
                },
              }}
            >
              {userSubTabs.map((tab) => (
                <Tab key={tab.label} label={tab.label} />
              ))}
            </Tabs>
          </Box>
          <Box role="tabpanel">
            {userSubTabs[currentUserSubTab]?.component}
          </Box>
        </Box>
      );
    }
    return tabs[currentTab]?.component;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 200,
              minWidth: 120,
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 200,
              },
            },
          }}
        >
          {tabs.map((tab, idx) => (
            <Tab key={tab.label} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      <PageLayout title="Tenant Admin Settings">
        <Box className="settings-container">


          <Box role="tabpanel">
            {renderTabContent()}
          </Box>
        </Box>
      </PageLayout>
    </Box>
  );
};

export default Settings;