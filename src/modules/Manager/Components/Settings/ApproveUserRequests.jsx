import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useUserTenantApi } from "../../services/user-tenant-api";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { useTenant } from "../../contexts/TenantContext";
import { useAuth } from "../../auth/AuthContext";

export default function ApproveUserRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { tenant, isLoading: tenantLoading } = useTenant();
  const userTenantsApi = useUserTenantApi();
  const { getAccessTokenSilently } = useAuth();

  const fetchRequests = useCallback(async () => {
    // Don't fetch if tenant is not loaded yet
    if (!tenant?.tenantId) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();
      const users = await userTenantsApi.getPendingUserTenantRequests(token, tenant.tenantId);
      setRequests(users);
    } catch (e) {
      setError("Failed to fetch requests");
      console.error("Error fetching requests:", e);
    }
    setLoading(false);
  }, [userTenantsApi, tenant?.tenantId, getAccessTokenSilently]);

  useEffect(() => {
    // Only fetch when tenant is loaded and has tenantId
    if (!tenantLoading && tenant?.tenantId) {
      fetchRequests();
    }
  }, [fetchRequests, tenantLoading, tenant?.tenantId]);

  const handleApprove = async (userId) => {
    if (!tenant?.tenantId) {
      setError("Tenant information not available");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      await userTenantsApi.approveUserTenantRequest(userId, tenant.tenantId, token);
      setSuccess("Request approved successfully");
      fetchRequests();
    } catch (e) {
      setError("Failed to approve request");
      console.error("Error approving request:", e);
    }
  };

  const handleDeny = async (userId) => {
    if (!tenant?.tenantId) {
      setError("Tenant information not available");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      await userTenantsApi.denyUserTenantRequest(userId, tenant.tenantId, token);
      setSuccess("Request denied successfully");
      fetchRequests();
    } catch (e) {
      setError("Failed to deny request");
      console.error("Error denying request:", e);
    }
  };

  // Show loading while tenant data is being loaded
  if (tenantLoading) {
    return (
      <Box>
        <Typography variant="h6" mb={2}>
          Approve User Requests
        </Typography>
        <LoadingSpinner />
      </Box>
    );
  }

  // Show error if tenant data is not available
  if (!tenant?.tenantId) {
    return (
      <Box>
        <Typography variant="h6" mb={2}>
          Approve User Requests
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Tenant information is not available. Please ensure you have proper access to this tenant.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Approve User Requests
      </Typography>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {requests.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No pending user requests found.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.name}</TableCell>
                    <TableCell>{req.email}</TableCell>
                    <TableCell>
                      <Button
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(req.userId)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleDeny(req.userId)}
                      >
                        Deny
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={2000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
}
