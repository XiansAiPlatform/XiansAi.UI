import React, { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import UserManagement from "./UserManagement";
import TenantManagement from "./TenantManagement";
import TokenUsageManagement from "./Usage/TokenUsageManagement";
import PageLayout from '../Common/PageLayout';

const tabLabels = [
  "Tenants",
  "Users",
  "Usage Limits",
];

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="system admin tabs"
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
          {tabLabels.map((label, idx) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Box>

      <PageLayout title="System Admin">
        <Box className="settings-container">
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-paper)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'var(--border-color-hover)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            <Box>
              {tab === 0 && <TenantManagement />}
              {tab === 1 && <UserManagement />}
              {tab === 2 && <TokenUsageManagement />}
            </Box>
          </Paper>
        </Box>
      </PageLayout>
    </Box>
  );
}
