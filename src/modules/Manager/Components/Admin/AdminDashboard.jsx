import React, { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import UserManagement from "./UserManagement";
import TenantManagement from "./TenantManagement";
import PageLayout from '../Common/PageLayout';

const tabLabels = [
  "Tenants",
  "Users",
];

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <PageLayout title="System Admin">
      <Box className="settings-container">
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3,
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-paper)'
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              mb: 3,
              borderBottom: '1px solid var(--border-color)',
              '& .MuiTab-root': {
                fontFamily: 'var(--font-family)',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                color: 'var(--text-secondary)',
                '&.Mui-selected': {
                  color: 'var(--primary)',
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--primary)',
                height: '3px',
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            {tabLabels.map((label, idx) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
          <Box>
            {tab === 0 && <TenantManagement />}
            {tab === 1 && <UserManagement />}
          </Box>
        </Paper>
      </Box>
    </PageLayout>
  );
}
