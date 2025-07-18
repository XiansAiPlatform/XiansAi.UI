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
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useUserApi } from "../../services/user-api";
import { useUserTenantApi } from "../../services/user-tenant-api";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { useAuth } from "../../auth/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { useSlider } from "../../contexts/SliderContext";
import UserFormSettings from "./UserFormSettings";

export default function TenantUserManagement() {
  const { getAccessTokenSilently } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const userApi = useUserApi();
  const userTenantApi = useUserTenantApi();
  const { openSlider, closeSlider } = useSlider();
  const [formLoading, setFormLoading] = useState(false);
  const fetchUsers = useCallback(async () => {
    console.log("Fetching users for tenant:", tenant);
    if (!tenant?.tenantId) return;
    setLoading(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();
      const data = await userTenantApi.getTenantUsers(token, {
        page,
        pageSize,
        filters: { ...filters, tenant: tenant.tenantId },
      });
      setUsers(data.users);
      setTotalUsers(data?.totalCount || 0);
    } catch (e) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", e);
    }
    setLoading(false);
  }, [userTenantApi, getAccessTokenSilently, page, pageSize, filters, tenant]);

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
          const token = await getAccessTokenSilently();
          await userTenantApi.updateTenantUser(token, formData, tenant.tenantId);
          setSuccess("User updated successfully");
          closeSlider();
          fetchUsers();
          setFormLoading(false);
        }}
        onClose={closeSlider}
      />,
      "Edit User"
    );
  };

  if (tenantLoading || !tenant?.tenantId) {
    return <LoadingSpinner />;
  }

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
        <Typography variant="h6">Tenant User Management</Typography>
      </Box>

      {loading ? (
        <LoadingSpinner />
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
                    <Tooltip title="Delete User">
                      <IconButton
                        onClick={() => handleDelete(user.userId)}
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
