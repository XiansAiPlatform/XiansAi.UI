import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Paper,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import { useUserTenantApi } from "../../services/user-tenant-api";
import { useAuth } from "../../auth/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { useSlider } from "../../contexts/SliderContext";
import { useLoading } from "../../contexts/LoadingContext";
import UserFormSettings from "./UserFormSettings";
import ConfirmationDialog from "../Common/ConfirmationDialog";
import { useConfirmation } from "../Common/useConfirmation";

export default function TenantUserManagement() {
  const { getAccessTokenSilently } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { setLoading } = useLoading();
  const [users, setUsers] = useState([]);
  const [loading, setLocalLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingFilters, setPendingFilters] = useState({
    type: "ALL",
    search: "",
  });
  const [filters, setFilters] = useState({
    type: "ALL",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const userTenantApi = useUserTenantApi();
  const { openSlider, closeSlider } = useSlider();
  const [formLoading, setFormLoading] = useState(false);
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();

  const fetchUsers = useCallback(async () => {
    console.log("Fetching users for tenant:", tenant);
    if (!tenant?.tenantId) {
      console.log("No tenant ID available, skipping user fetch");
      return;
    }
    
    setLocalLoading(true);
    setLoading(true);
    setError("");
    try {
      console.log("Getting access token...");
      const token = await getAccessTokenSilently();
      
      console.log("Calling getTenantUsers API with:", {
        page,
        pageSize,
        filters: { ...filters, tenant: tenant.tenantId },
      });
      
      const data = await userTenantApi.getTenantUsers(token, {
        page,
        pageSize,
        filters: { ...filters, tenant: tenant.tenantId },
      });
      
      console.log("Received user data:", data);
      setUsers(data.users || []);
      setTotalUsers(data?.totalCount || 0);
    } catch (e) {
      console.error("Error fetching users:", e);
      setError("Failed to fetch users: " + (e.message || "Unknown error"));
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }, [
    userTenantApi,
    getAccessTokenSilently,
    page,
    pageSize,
    filters,
    tenant,
    setLoading,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (field) => (event) => {
    setPendingFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Only apply filters and reset page when button is clicked
  const handleApplyFilters = () => {
    setFilters({ ...pendingFilters });
    setPage(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleDelete = async (user) => {
    showConfirmation({
      title: 'Remove User from Tenant',
      message: `Are you sure you want to remove "${user.name}" (${user.email}) from this tenant? The user will no longer have access to this tenant, but their account will remain in the system.`,
      confirmLabel: 'Remove from Tenant',
      dangerLevel: 'medium',
      entityName: user.name,
      onConfirm: async () => {
        try {
          const token = await getAccessTokenSilently();
          await userTenantApi.removeUserFromTenant(token, user.userId, tenant.tenantId);
          setSuccess("User removed from tenant successfully");
          hideConfirmation();
          fetchUsers();
        } catch (e) {
          setError("Failed to remove user from tenant");
          console.error("Error removing user from tenant:", e);
          hideConfirmation();
        }
      },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getTenantRolesDisplay = (tenantRoles) => {
    if (!tenantRoles || tenantRoles.length === 0) return "No tenants";
    return tenantRoles
      .filter((x) => x.tenant === tenant.tenantId)
      .map((tr) => (
        <Chip
          key={tr.tenant}
          label={`${tr.roles.length > 0 ? ` ${tr.roles.join(", ")}` : ""}`}
          size="small"
          color={tr.is_approved ? "success" : "warning"}
          variant="outlined"
          sx={{ mr: 0.5, mb: 0.5 }}
          onClick={() => {}}
        />
      ));
  };

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  const handlePaginationChange = (event, value) => {
    setPage(value);
  };

  const handleEditUser = (user) => {
    openSlider(
      <UserFormSettings
        initialData={user}
        loading={formLoading}
        onSave={async (formData) => {
          setFormLoading(true);
          try {
            const token = await getAccessTokenSilently();
            await userTenantApi.updateTenantUser(token, formData, tenant.tenantId);
            setSuccess("User updated successfully");
            closeSlider();
            fetchUsers();
          } catch (error) {
            setError(error.message || "Failed to update user");
            throw error; // Re-throw so form can also display the error
          } finally {
            setFormLoading(false);
          }
        }}
        onClose={closeSlider}
      />,
      "Edit User"
    );
  };

  // Open add user dialog
  const handleOpenAddUserDialog = () => {
    setAddUserDialogOpen(true);
    setAddEmail("");
    setError("");
  };

  // Close add user dialog
  const handleCloseAddUserDialog = () => {
    setAddUserDialogOpen(false);
    setAddEmail("");
    setError("");
  };

  // Add user by email handler
  const handleAddUserByEmail = async () => {
    if (!addEmail.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addEmail.trim())) {
      setError("Please enter a valid email format.");
      return;
    }

    setAddLoading(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();
      await userTenantApi.addUserToTenantByEmail(
        token,
        addEmail.trim(),
        tenant.tenantId
      );
      setSuccess("✅ User successfully added to tenant!");
      setAddEmail("");
      setAddUserDialogOpen(false);
      fetchUsers();
    } catch (e) {
      console.log("Error adding user by email:", e);
      let errorMessage = "❌ Failed to add user to tenant.";
      
      if (e?.statusCode === 404) {
        errorMessage = "❌ User with this email address does not exist in the system. Please make sure the user has registered first.";
      } else if (e?.statusCode === 409) {
        errorMessage = "⚠️ User is already a member of this tenant.";
      } else if (e?.errorMessage) {
        errorMessage = `❌ ${e.errorMessage}`;
      }
      
      setError(errorMessage);
      console.error("Error adding user by email:", e);
    }
    setAddLoading(false);
  };

  if (tenantLoading || loading) {
    return null; // LoadingContext will show the top progress bar
  }

  if (!tenant?.tenantId) {
    return (
      <Paper className="ca-certificates-paper">
        <Typography variant="h6" gutterBottom>
          Tenant User Management
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Tenant information is not available. Please ensure you have proper access to this tenant.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper className="ca-certificates-paper">
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Tenant User Management
      </Typography>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        {/* Left: Filters */}
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={pendingFilters.type}
              label="User Type"
              onChange={handleFilterChange("type")}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="NON_ADMIN">Non-Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Name or Email"
            value={pendingFilters.search}
            onChange={handleFilterChange("search")}
          />
          <Button
            variant="outlined"
            onClick={handleApplyFilters}
            sx={{ ml: 2 }}
          >
            Apply Filters
          </Button>
        </Box>

        {/* Right: Add User Button */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenAddUserDialog}
        >
          Add User by Email
        </Button>
      </Box>

      {/* Divider for separation */}
      <Divider sx={{ my: 2 }} />

      {users && users.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          px={2}
        >
          <PeopleOutlineIcon
            sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Users Found
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 400 }}>
            There are no users in this tenant yet. Click the "Add User by Email" button above to add existing users to this tenant.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenAddUserDialog}
          >
            Add User by Email
          </Button>
        </Box>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tenant Roles</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.isLockedOut ? (
                      <Chip
                        label="Locked"
                        color="error"
                        size="small"
                        icon={<LockIcon />}
                        onClick={() => {}}
                      />
                    ) : (
                      <Chip
                        label="Active"
                        color="success"
                        size="small"
                        icon={<LockOpenIcon />}
                        onClick={() => {}}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap">
                      {getTenantRolesDisplay(user.tenantRoles)}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit Tenant">
                      <IconButton
                        color="primary"
                        sx={{ mr: 1 }}
                        onClick={() => handleEditUser(user)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove User from Tenant">
                      <IconButton
                        onClick={() => handleDelete(user)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mt={2}
          >
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Rows</InputLabel>
              <Select
                value={pageSize}
                label="Rows"
                onChange={handlePageSizeChange}
              >
                {[5, 10, 25, 50].map((size) => (
                  <MenuItem key={size} value={size}>
                    {size} / page
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePaginationChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}

      {/* Add User Dialog */}
      <Dialog 
        open={addUserDialogOpen} 
        onClose={handleCloseAddUserDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonAddIcon color="primary" />
            Add User by Email
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Add an existing user to this tenant by entering their email address. 
              The user must already be registered in the system.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Email Address"
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              disabled={addLoading}
              placeholder="user@example.com"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !addLoading) {
                  handleAddUserByEmail();
                }
              }}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {error}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseAddUserDialog} 
            disabled={addLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddUserByEmail}
            disabled={addLoading || !addEmail.trim()}
            startIcon={addLoading ? null : <PersonAddIcon />}
          >
            {addLoading ? "Adding..." : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Success/Error Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            fontSize: '1rem',
            fontWeight: 'medium',
            minWidth: '400px'
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          sx={{ 
            fontSize: '1rem',
            fontWeight: 'medium',
            minWidth: '400px'
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        {...confirmationState}
        onCancel={hideConfirmation}
      />
    </Paper>
  );
}
