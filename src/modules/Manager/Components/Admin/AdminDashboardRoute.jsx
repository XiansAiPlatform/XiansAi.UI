import React from "react";
import { useTenant } from "../../contexts/TenantContext";
import AdminDashboard from "./AdminDashboard";
import Landing from "../Landing/Landing";
import EnhancedLoadingSpinner from "../../../../components/EnhancedLoadingSpinner";

export default function AdminDashboardRoute() {
  const { userRoles, isLoading } = useTenant();

  if (isLoading) {
    return <EnhancedLoadingSpinner />;
  }

  // Check if user has sysadmin role
  const isSysAdmin =
    userRoles &&
    userRoles.some(
      (role) =>
        role.toLowerCase() === "sysadmin" 
    );

  if (isSysAdmin) {
    return <AdminDashboard />;
  }

  return <Landing />;
}
