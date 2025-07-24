import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useTenant } from "../../contexts/TenantContext";

export default function UserFormSettings({
  initialData,
  onSave,
  onClose,
  loading,
}) {
  const { tenant } = useTenant();
  const isEdit = Boolean(initialData && initialData.userId);
  const [form, setForm] = useState({
    name: "",
    email: "",
    isSysAdmin: false,
    active: true,
  });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const allRoles = ["TenantAdmin", "TenantUser"];

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        isSysAdmin: !!initialData.isSysAdmin,
        active: initialData.isLockedOut === false,
      });
      // Find roles for the current tenant only
      const tenantRole = (initialData.tenantRoles || []).find(
        (tr) => tr.tenant === tenant?.tenantId
      );
      setRoles(tenantRole ? tenantRole.roles : []);
    } else {
      setRoles([]);
    }
  }, [initialData, tenant]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRolesChange = (e) => {
    setRoles(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and Email are required.");
      return;
    }
    try {
      // Only update roles for the current tenant
      const tenantRoles = [
        {
          tenant: tenant.tenantId,
          roles,
          isApproved: true,
        },
      ];
      await onSave({ ...form, userId: initialData?.userId, tenantRoles });
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
      <Box>
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
      </Box>
      <FormControl size="small" sx={{ minWidth: 180, mt: 2 }}>
        <InputLabel>Roles</InputLabel>
        <Select
          multiple
          value={roles}
          onChange={handleRolesChange}
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
      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {isEdit ? "Save" : "Add"}
        </Button>
      </Box>
    </Box>
  );
}
