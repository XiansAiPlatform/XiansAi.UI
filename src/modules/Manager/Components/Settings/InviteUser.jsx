import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Paper,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { useUserApi } from "../../services/user-api";
import { useTenant } from "../../contexts/TenantContext";
import { useAuth } from "../../auth/AuthContext";
import EnhancedLoadingSpinner from "../../../../components/EnhancedLoadingSpinner";

export default function InviteUser() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { getAccessTokenSilently } = useAuth();
  const userApi = useUserApi();
  const [invitations, setInvitations] = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError] = useState("");

  const fetchInvitations = async () => {
    if (!tenant?.tenantId) return;
    setInvLoading(true);
    setInvError("");
    try {
      const token = await getAccessTokenSilently();
      const data = await userApi.getInvitations(token, tenant.tenantId);
      console.log("Fetched invitations:", data);
      setInvitations(data);
    } catch (e) {
      setInvError("Failed to fetch invitations");
      setInvitations([]);
    }
    setInvLoading(false);
  };

  React.useEffect(() => {
    // Only fetch when tenant is loaded and has tenantId
    if (!tenantLoading && tenant?.tenantId) {
      fetchInvitations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.tenantId, tenantLoading]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter a valid email address");
      return;
    }

    if (!tenant?.tenantId) {
      setError("Tenant information not available");
      return;
    }

    setSending(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();
      await userApi.inviteUser(token, email, tenant.tenantId);
      setSuccess("Invitation sent successfully!");
      setEmail("");
      await fetchInvitations();
    } catch (e) {
      setError("Failed to send invitation. Please try again.");
      console.error("Error sending invitation:", e);
    }
    setSending(false);
  };

  const handleDeleteInvitation = async (inviteToken) => {
    if (!window.confirm("Delete this invitation?")) return;
    
    if (!tenant?.tenantId) {
      setError("Tenant information not available");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      await userApi.deleteInvitation(token, inviteToken, tenant.tenantId);
      setSuccess("Invitation deleted successfully");
      await fetchInvitations();
    } catch (e) {
      setError("Failed to delete invitation");
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Show loading while tenant data is being loaded
  if (tenantLoading) {
    return (
      <Paper className="ca-certificates-paper">
        <Typography variant="h6" gutterBottom>
          Invite New User
        </Typography>
        <EnhancedLoadingSpinner showRefreshOption={false} height="300px" />
      </Paper>
    );
  }

  // Show error if tenant data is not available
  if (!tenant?.tenantId) {
    return (
      <Paper className="ca-certificates-paper">
        <Typography variant="h6" gutterBottom>
          Invite New User
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
        Invite New User
      </Typography>

      <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
        <form onSubmit={handleInvite}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Enter the email address of the user you want to invite. They
                will receive an invitation email with instructions to join the
                system.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="User Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                fullWidth
                placeholder="user@example.com"
                error={email && !validateEmail(email)}
                helperText={
                  email && !validateEmail(email)
                    ? "Please enter a valid email address"
                    : ""
                }
                disabled={sending}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={sending || !email.trim() || !validateEmail(email)}
                fullWidth
                size="large"
              >
                {sending ? "Sending Invitation..." : "Send Invitation"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>

      <Box mt={4}>
        <Typography variant="h6" mb={1}>
          Invitations
        </Typography>
        {invLoading ? (
          <Typography variant="body2">Loading...</Typography>
        ) : invitations.length === 0 ? (
          <Typography variant="body2">No invitations found.</Typography>
        ) : (
          <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th align="left">Email</th>
                    <th align="left">Status</th>
                    <th align="left">Created</th>
                    <th align="left">Expires</th>
                    <th align="left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.email + inv.tenantId}>
                      <td>{inv.email}</td>
                      <td>
                        {inv.status === 0
                          ? "Pending"
                          : inv.status === 1
                          ? "Accepted"
                          : "Expired"}
                      </td>
                      <td>
                        {inv.createdAt
                          ? new Date(inv.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        {inv.expiresAt
                          ? new Date(inv.expiresAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <Button
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteInvitation(inv.token)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        )}
        {invError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {invError}
          </Alert>
        )}
      </Box>
    </Paper>
  );
}
