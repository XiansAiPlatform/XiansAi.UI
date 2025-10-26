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
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useUserTenantApi } from "../../services/user-tenant-api";
import { useTenant } from "../../contexts/TenantContext";
import { useAuth } from "../../auth/AuthContext";
import { useLoading } from "../../contexts/LoadingContext";

export default function ApproveUserRequests() {
  const [requests, setRequests] = useState([]);
  const { setLoading } = useLoading();
  const [loading, setLocalLoading] = useState(true);
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

    setLocalLoading(true);
    setLoading(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();
      const users = await userTenantsApi.getPendingUserTenantRequests(token, tenant.tenantId);
      setRequests(users);
    } catch (e) {
      setError("Failed to fetch requests");
      console.error("Error fetching requests:", e);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }, [userTenantsApi, tenant?.tenantId, getAccessTokenSilently, setLoading]);

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
  if (tenantLoading || loading) {
    return null; // LoadingContext will show the top progress bar
  }

  // Show error if tenant data is not available
  if (!tenant?.tenantId) {
    return (
      <Paper className="ca-certificates-paper">
        <Typography variant="h6" gutterBottom>
          Approve User Requests
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Tenant information is not available. Please ensure you have proper access to this tenant.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper className="ca-certificates-paper">
      <Typography variant="h6" gutterBottom>
        Approve User Requests
      </Typography>

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
    </Paper>
  );
}
