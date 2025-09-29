import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
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
  Stack,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useUserApi } from "../../services/user-api";
import EnhancedLoadingSpinner from "../../../../components/EnhancedLoadingSpinner";
import { useAuth } from "../../auth/AuthContext";
import { useTenantsApi } from "../../services/tenants-api";
import { useSlider } from "../../contexts/SliderContext";
import UserForm from "./UserForm";

export default function UserManagement() {
  const { getAccessTokenSilently } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Separate pendingFilters (UI) and filters (used for fetching)
  const [pendingFilters, setPendingFilters] = useState({
    type: "ALL",
    tenant: "",
    search: "",
  });
  const [filters, setFilters] = useState({
    type: "ALL",
    tenant: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [tenantOptions, setTenantOptions] = useState([
    { value: "", label: "All Tenants" },
  ]);

  const userApi = useUserApi();
  const tenantsApi = useTenantsApi();
  const { openSlider, closeSlider } = useSlider();
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    async function fetchTenants() {
      try {
        const tenants = await tenantsApi.getTenantList();
        setTenantOptions([
          { value: "", label: "All Tenants" },
          ...tenants.map((name) => ({
            value: name,
            label: name,
          })),
        ]);
      } catch (e) {
        setTenantOptions([{ value: "", label: "All Tenants" }]);
      }
    }
    fetchTenants();
  }, [tenantsApi]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();
      const data = await userApi.getUsers(token, {
        page,
        pageSize,
        filters,
      });
      setUsers(data.users);
      setTotalUsers(data?.totalCount || 0);
    } catch (e) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", e);
    }
    setLoading(false);
  }, [userApi, getAccessTokenSilently, page, pageSize, filters]);

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

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const token = await getAccessTokenSilently();
      await userApi.deleteUser(token, userId);
      setSuccess("User deleted successfully");
      fetchUsers();
    } catch (e) {
      setError("Failed to delete user");
      console.error("Error deleting user:", e);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getTenantRolesDisplay = (tenantRoles) => {
    if (!tenantRoles || tenantRoles.length === 0) return "No tenants";

    return tenantRoles.map((tr) => (
      <Chip
        key={tr.tenant}
        label={`${tr.tenant}${
          tr.roles.length > 0 ? ` (${tr.roles.join(", ")})` : ""
        }`}
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
    console.log("Pagination change:", value);
    setPage(value);
  };

  const handleEditUser = (user) => {
    openSlider(
      <UserForm
        initialData={user}
        loading={formLoading}
        tenantOptions={tenantOptions}
        onSave={async (formData) => {
          setFormLoading(true);
          const token = await getAccessTokenSilently();
          await userApi.updateUser(token, formData);
          setSuccess("Invitation sent successfully");
          closeSlider();
          fetchUsers();
          setFormLoading(false);
        }}
        onClose={closeSlider}
      />,
      "Edit User"
    );
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={2} alignItems="center">
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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Tenant</InputLabel>
          <Select
            value={pendingFilters.tenant}
            label="Tenant"
            onChange={handleFilterChange("tenant")}
          >
            {tenantOptions.map((tenant) => (
              <MenuItem key={tenant.value} value={tenant.value}>
                {tenant.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Name or Email"
          value={pendingFilters.search}
          onChange={handleFilterChange("search")}
        />
        <Button variant="outlined" onClick={handleApplyFilters} sx={{ ml: 2 }}>
          Apply Filters
        </Button>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">User Management</Typography>
      </Box>

      {loading ? (
        <EnhancedLoadingSpinner showRefreshOption={false} height="400px" />
      ) : (
        <>
          <Stack spacing={2}>
            {users.map((user) => (
                <Card 
                  elevation={0} 
                  sx={{ 
                    width: '100%', 
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--bg-paper)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--border-color-hover)',
                      transform: 'translateY(-1px)',
                      boxShadow: 'var(--shadow-sm)'
                    }
                  }} 
                  key={user.userId}
                >
                  <CardContent sx={{ px: 3, py: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      {/* Left side - Main user info */}
                      <Box sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Typography variant="h6" component="div">
                            {user.name}
                          </Typography>
                          <Box display="flex" gap={0.5}>
                            <Chip
                              label={user.isSysAdmin ? "System Admin" : "User"}
                              color={user.isSysAdmin ? "primary" : "default"}
                              size="small"
                            />
                            {user.isLockedOut ? (
                              <Chip
                                label="Locked"
                                color="error"
                                size="small"
                                icon={<LockIcon />}
                              />
                            ) : (
                              <Chip
                                label="Active"
                                color="success"
                                size="small"
                                icon={<LockOpenIcon />}
                              />
                            )}
                          </Box>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={3} mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            User ID: {user.userId}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={3}>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {getTenantRolesDisplay(user.tenantRoles)}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Created: {formatDate(user.createdAt)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Updated: {formatDate(user.updatedAt)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right side - Actions */}
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit User">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditUser(user)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            onClick={() => handleDelete(user.userId)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
            ))}
          </Stack>
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
