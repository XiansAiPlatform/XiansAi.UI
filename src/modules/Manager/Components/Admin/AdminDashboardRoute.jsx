import React from "react";
import { useTenant } from "../../contexts/TenantContext";
import AdminDashboard from "./AdminDashboard";
import NotAuthorized from "../NotAuthorized/NotAuthorized";
import LoadingSpinner from "../../../../components/LoadingSpinner";

export default function AdminDashboardRoute() {
  const { userRoles, isLoading } = useTenant();

  if (isLoading) {
    return <LoadingSpinner />;
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

  return <NotAuthorized />;
}
