import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  Paper,
  Switch,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useTenantsApi } from "../../services/tenants-api";
import { useLoading } from "../../contexts/LoadingContext";
import TenantInfoForm from "./TenantInfoForm";
import TenantAdminManager from "./TenantAdminManager";
import { useSlider } from "../../contexts/SliderContext";
import ConfirmationDialog from "../Common/ConfirmationDialog";
import { useConfirmation } from "../Common/useConfirmation";

export default function TenantManagement() {
  const [tenants, setTenants] = useState([]);
  const { setLoading } = useLoading();
  const [loading, setLocalLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("");
  const { openSlider, closeSlider } = useSlider();
  const [switchLoading, setSwitchLoading] = useState({});
  const tenantsApi = useTenantsApi();
  const [createLoading, setCreateLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    tenantId: "",
    domain: "",
  });
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();

  const fetchTenants = useCallback(async () => {
    setLocalLoading(true);
    setLoading(true);
    setError("");
    try {
      const data = await tenantsApi.getAllTenants();
      setTenants(data || []);
    } catch (e) {
      setError("Failed to fetch tenants");
      console.error("Error fetching tenants:", e);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }, [tenantsApi, setLoading]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleDelete = async (tenantId, tenantName) => {
    showConfirmation({
      title: 'Delete Tenant',
      message: `Are you sure you want to permanently delete the tenant "${tenantName}"? All data, users, and configurations associated with this tenant will be permanently removed.`,
      confirmLabel: 'Delete Tenant',
      dangerLevel: 'critical',
      entityName: tenantName,
      onConfirm: async () => {
        try {
          await tenantsApi.deleteTenant(tenantId);
          setSuccess("Tenant deleted successfully");
          hideConfirmation();
          fetchTenants();
        } catch (e) {
          setError("Failed to delete tenant");
          console.error("Error deleting tenant:", e);
          hideConfirmation();
        }
      },
    });
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name?.toLowerCase().includes(filter.toLowerCase()) ||
      tenant.tenantId?.toLowerCase().includes(filter.toLowerCase()) ||
      tenant.domain?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleEditAdmin = (tenant) => {
    openSlider(
      <TenantAdminManager
        tenant={tenant}
        onClose={closeSlider}
        onChanged={fetchTenants}
      />,
      `Manage Admins for ${tenant.name}`
    );
  };

  const handleToggleEnabled = async (tenantId, currentlyEnabled, tenantName) => {
    if (!tenantId) return;
    
    // Show confirmation for disabling tenant (dangerous action)
    if (currentlyEnabled) {
      showConfirmation({
        title: 'Disable Tenant',
        message: `Are you sure you want to disable the tenant "${tenantName}"? Users will not be able to access this tenant until it is re-enabled.`,
        confirmLabel: 'Disable Tenant',
        dangerLevel: 'high',
        onConfirm: async () => {
          await performToggle(tenantId, currentlyEnabled);
          hideConfirmation();
        },
      });
    } else {
      // Enabling is less dangerous, just do it
      await performToggle(tenantId, currentlyEnabled);
    }
  };

  const performToggle = async (tenantId, currentlyEnabled) => {
    setSwitchLoading((prev) => ({ ...prev, [tenantId]: true }));
    try {
      await tenantsApi.updateTenant(tenantId, { enabled: !currentlyEnabled });
      setTenants((prevTenants) =>
        prevTenants.map((tenant) => {
          const matchesId =
            tenant.id === tenantId || tenant.tenantId === tenantId;
          return matchesId
            ? {
                ...tenant,
                enabled: !currentlyEnabled,
                isEnabled: !currentlyEnabled,
              }
            : tenant;
        })
      );
      setSuccess(`Tenant ${currentlyEnabled ? 'disabled' : 'enabled'} successfully`);
    } catch (err) {
      setError(
        `Failed to ${
          currentlyEnabled ? "disable" : "enable"
        } tenant. Please try again.`
      );
      console.error("Error toggling tenant status:", err);
    } finally {
      setSwitchLoading((prev) => ({ ...prev, [tenantId]: false }));
    }
  };

  const handleCreateTenant = async () => {
    if (!createForm.name.trim()) {
      setCreateError("Tenant name is required");
      return;
    }
    if (!createForm.tenantId.trim()) {
      setCreateError("Tenant ID is required");
      return;
    }
    if (!createForm.domain.trim()) {
      setCreateError("Domain is required");
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const newTenantData = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        tenantId: createForm.tenantId.trim(),
        domain: createForm.domain.trim(),
        enabled: true,
      };
      const response = await tenantsApi.createTenant(newTenantData);
      const newTenant = response.tenant;
      const tenantToAdd = {
        ...newTenant,
        id: newTenant.id || newTenant.tenantId || createForm.tenantId.trim(),
        tenantId:
          newTenant.tenantId || newTenant.id || createForm.tenantId.trim(),
        name: newTenant.name || newTenant.tenantName || createForm.name.trim(),
        tenantName:
          newTenant.tenantName || newTenant.name || createForm.name.trim(),
        description: newTenant.description || createForm.description.trim(),
        domain: newTenant.domain || createForm.domain.trim(),
        enabled: newTenant.enabled !== undefined ? newTenant.enabled : true,
        isEnabled:
          newTenant.isEnabled !== undefined
            ? newTenant.isEnabled
            : newTenant.enabled !== undefined
            ? newTenant.enabled
            : true,
      };
      setTenants((prevTenants) => [...prevTenants, tenantToAdd]);
      handleCreateDialogClose();
      setError(null);
    } catch (err) {
      setCreateError("Failed to create tenant. Please try again.");
      console.error("Error creating tenant:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
    setCreateError(null);
    setCreateForm({ name: "", description: "", tenantId: "", domain: "" });
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setCreateError(null);
    setCreateForm({ name: "", description: "", tenantId: "", domain: "" });
  };

  const handleCreateFormChange = (field) => (event) => {
    setCreateForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <TextField
          size="small"
          label="Search Tenant"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ flex: 1, maxWidth: 300 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateDialogOpen}
          sx={{ ml: 2 }}
        >
          Create Tenant
        </Button>
      </Box>
      <Box mb={2}>
        <Typography variant="h6">Tenant Management</Typography>
      </Box>
      <Box>
        {loading ? null : (
          filteredTenants.map((tenant) => {
            const tenantId = tenant.id || tenant.tenantId;
            const isEnabled = tenant.enabled ?? tenant.isEnabled ?? true;
            const isToggleLoading = switchLoading[tenantId] || false;
            return (
              <Paper
                key={tenantId}
                variant="outlined"
                sx={{ 
                  p: 2, 
                  mb: 1,
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-paper)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'var(--border-color-hover)',
                    transform: 'translateY(-1px)',
                    boxShadow: 'var(--shadow-sm)'
                  }
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isToggleLoading && <CircularProgress size={16} />}
                      </Box>
                      <Switch
                        checked={isEnabled}
                        onChange={() =>
                          handleToggleEnabled(tenantId, isEnabled, tenant.name || tenant.tenantName)
                        }
                        disabled={isToggleLoading || !tenantId}
                        color="primary"
                      />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 500 }}
                        >
                          {tenant.name || tenant.tenantName}
                        </Typography>
                        {tenant.description && (
                          <Typography variant="body2" color="text.secondary">
                            {tenant.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEditAdmin(tenant)}
                    >
                      Admins
                    </Button>
                    <Tooltip title="Edit Tenant">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          openSlider(
                            <TenantInfoForm
                              tenant={tenant}
                              onClose={closeSlider}
                              onSaved={fetchTenants}
                            />,
                            "Edit Tenant Info"
                          )
                        }
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Tenant">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(tenantId, tenant.name || tenant.tenantName)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            );
          })
        )}
      </Box>
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
      {/* Create Tenant Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Tenant</DialogTitle>
        <DialogContent>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Tenant Name"
            type="text"
            fullWidth
            variant="outlined"
            value={createForm.name}
            onChange={handleCreateFormChange("name")}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Tenant ID"
            type="text"
            fullWidth
            variant="outlined"
            value={createForm.tenantId}
            onChange={handleCreateFormChange("tenantId")}
            required
            sx={{ mb: 2 }}
            helperText="Unique identifier for the tenant"
          />
          <TextField
            margin="dense"
            label="Domain"
            type="text"
            fullWidth
            variant="outlined"
            value={createForm.domain}
            onChange={handleCreateFormChange("domain")}
            required
            sx={{ mb: 2 }}
            helperText="Domain associated with this tenant"
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={createForm.description}
            onChange={handleCreateFormChange("description")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose} disabled={createLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateTenant}
            variant="contained"
            disabled={
              createLoading ||
              !createForm.name.trim() ||
              !createForm.tenantId.trim() ||
              !createForm.domain.trim()
            }
          >
            {createLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                Creating...
              </Box>
            ) : (
              "Create Tenant"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        {...confirmationState}
        onCancel={hideConfirmation}
      />
    </Box>
  );
}
