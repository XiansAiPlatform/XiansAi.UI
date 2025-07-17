import React, { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import UserManagement from "./UserManagement";
import TenantManagement from "./TenantManagement";

const tabLabels = [
  "Tenants",
  "Users",
];

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);

  return (
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
  );
}
