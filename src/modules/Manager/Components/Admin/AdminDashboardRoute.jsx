import React from "react";
import { useTenant } from "../../contexts/TenantContext";
import AdminDashboard from "./AdminDashboard";
import Landing from "../Landing/Landing";

export default function AdminDashboardRoute() {
  const { isSysAdmin, isLoading } = useTenant();

  if (isLoading) {
    return null; // LoadingContext will show the top progress bar
  }

  if (isSysAdmin) {
    return <AdminDashboard />;
  }

  return <Landing />;
}
