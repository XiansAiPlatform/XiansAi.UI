import React, { useState } from "react";
import { Box, Tabs, Tab, Paper, Typography, Container } from "@mui/material";
import UserManagement from "./UserManagement";
import TenantManagement from "./TenantManagement";

const tabLabels = [
  "Tenants",
  "Users",
];

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);

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
          System Admin
        </Typography>
        <Paper elevation={3} sx={{ p: 3, m: 2 }}>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
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
    </Container>
  );
}
