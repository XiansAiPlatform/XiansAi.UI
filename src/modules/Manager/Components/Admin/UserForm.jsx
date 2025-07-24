import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Switch,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function UserForm({
  initialData,
  onSave,
  onClose,
  loading,
  tenantOptions = [],
}) {
  const isEdit = Boolean(initialData && initialData.userId);
  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    userId: "",
    isSysAdmin: false,
    active: true,
  });
  const [tenantRoles, setTenantRoles] = useState([]);
  const [error, setError] = useState("");
  const [newTenant, setNewTenant] = useState("");
  const [newRoles, setNewRoles] = useState([]);
  const allRoles = ["TenantAdmin", "TenantUser"];

  useEffect(() => {
    if (initialData) {
      console.log("Initial data:", initialData);
      setForm({
        id: initialData.id || "",
        name: initialData.name || "",
        email: initialData.email || "",
        userId: initialData.userId || "",
        isSysAdmin: !!initialData.isSysAdmin,
        active: initialData.isLockedOut === false,
      });
      setTenantRoles(initialData.tenantRoles || []);
    } else {
      setTenantRoles([]);
    }
  }, [initialData]);

  // Auto-add tenant role when both tenant and roles are selected
  useEffect(() => {
    if (newTenant && newRoles.length > 0) {
      // Check if this tenant already exists
      if (tenantRoles.some((tr) => tr.tenant === newTenant)) {
        console.log("Tenant already exists, not adding duplicate:", newTenant);
        return;
      }
      
      const newTenantRole = { tenant: newTenant, roles: newRoles, isApproved: true };
      console.log("Auto-adding tenant role:", newTenantRole);
      
      setTenantRoles((prev) => {
        const updated = [...prev, newTenantRole];
        console.log("Updated tenantRoles:", updated);
        return updated;
      });
      
      // Clear the form after adding
      setNewTenant("");
      setNewRoles([]);
      console.log("Cleared new tenant/roles form");
    }
  }, [newTenant, newRoles, tenantRoles]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRemoveTenantRole = (tenant) => {
    setTenantRoles((prev) => prev.filter((tr) => tr.tenant !== tenant));
  };

  const handleEditTenantRoles = (tenant, roles) => {
    setTenantRoles((prev) =>
      prev.map((tr) => (tr.tenant === tenant ? { ...tr, roles } : tr))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    console.log("Form submission - tenantRoles being submitted:", tenantRoles);
    
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and Email are required.");
      return;
    }
    try {
      const formDataToSend = { ...form, tenantRoles };
      await onSave(formDataToSend);
    } catch (e) {
      setError(e.message || "Failed to save user");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={2} minWidth={350}>
      <Typography variant="h6" mb={2}>
        {isEdit ? "Edit User" : "Add User"}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {isEdit && (
        <TextField
          label="ID"
          value={initialData?.id || 'N/A'}
          fullWidth
          margin="normal"
          disabled
          helperText="This field is read-only"
        />
      )}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            disabled={loading}
          />
        </Grid>
      </Grid>
      <TextField
        label="User ID"
        name="userId"
        value={form.userId}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        disabled={loading}
        helperText={isEdit ? "Unique identifier for the user" : "Will be auto-generated if left empty"}
      />
      <FormControlLabel
        control={
          <Checkbox
            name="isSysAdmin"
            checked={form.isSysAdmin}
            onChange={handleChange}
            disabled={loading}
          />
        }
        label="System Admin"
      />
      <FormControlLabel
        control={
          <Checkbox
            name="active"
            checked={form.active}
            onChange={handleChange}
            disabled={loading}
          />
        }
        label="Active"
      />
      <Box mt={3} mb={1}>
        <Typography variant="subtitle1">Tenant Roles</Typography>
        {tenantRoles.map((tr) => (
          <Box key={tr.tenant} display="flex" alignItems="center" mb={1}>
            <FormControl
              size="small"
              sx={{ minWidth: 120, mr: 1, margin: 1 }}
              disabled
            >
              <InputLabel>Tenant</InputLabel>
              <Select value={tr.tenant} label="Tenant">
                <MenuItem value={tr.tenant}>{tr.tenant}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180, mr: 1, margin: 1 }}>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={tr.roles}
                onChange={(e) =>
                  handleEditTenantRoles(tr.tenant, e.target.value)
                }
                label="Roles"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                disabled={loading}
              >
                {allRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={tr.isApproved}
                  onChange={(e) => {
                    setTenantRoles((prev) =>
                      prev.map((item) =>
                        item.tenant === tr.tenant
                          ? { ...item, isApproved: e.target.checked }
                          : item
                      )
                    );
                  }}
                  disabled={loading}
                  color="primary"
                />
              }
              label="Approved"
              sx={{ ml: 1, mr: 1 }}
            />
            <IconButton
              onClick={() => handleRemoveTenantRole(tr.tenant)}
              disabled={loading}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <FormControl size="small" sx={{ minWidth: 120, margin: 1 }}>
            <InputLabel>Tenant</InputLabel>
            <Select
              value={newTenant}
              label="Tenant"
              onChange={(e) => setNewTenant(e.target.value)}
              disabled={loading}
            >
              {(() => {
                const availableTenants = tenantOptions.filter(
                  (t) =>
                    t.value && !tenantRoles.some((tr) => tr.tenant === t.value)
                );
                
                if (availableTenants.length === 0) {
                  return (
                    <MenuItem disabled>
                      No tenants available
                    </MenuItem>
                  );
                }
                
                return availableTenants.map((tenant) => (
                  <MenuItem key={tenant.value} value={tenant.value}>
                    {tenant.label}
                  </MenuItem>
                ));
              })()}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={newRoles}
              onChange={(e) => setNewRoles(e.target.value)}
              label="Roles"
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              disabled={loading || !newTenant}
            >
              {allRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {tenantOptions.filter(t => t.value && !tenantRoles.some(tr => tr.tenant === t.value)).length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Select a tenant and roles above - they will be added automatically to the list.
          </Typography>
        )}
      </Box>
      <Box mt={2} display="flex" gap={2}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {isEdit ? "Update" : "Add"}
        </Button>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
