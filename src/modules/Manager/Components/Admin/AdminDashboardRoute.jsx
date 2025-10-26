import React from "react";
import { useTenant } from "../../contexts/TenantContext";
import AdminDashboard from "./AdminDashboard";
import Landing from "../Landing/Landing";
import EnhancedLoadingSpinner from "../../../../components/EnhancedLoadingSpinner";

export default function AdminDashboardRoute() {
  const { isSysAdmin, isLoading } = useTenant();

  if (isLoading) {
    return <EnhancedLoadingSpinner />;
  }

  if (isSysAdmin) {
    return <AdminDashboard />;
  }

  return <Landing />;
}
