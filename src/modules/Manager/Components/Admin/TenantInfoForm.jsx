import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { useTenantsApi } from "../../services/tenants-api";

export default function TenantInfoForm({ tenant, onClose, onSaved }) {
  const tenantsApi = useTenantsApi();
  const [form, setForm] = useState({
    name: tenant.name || "",
    domain: tenant.domain || "",
    description: tenant.description || "",
    enabled: tenant.enabled !== false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await tenantsApi.updateTenant(tenant.id || tenant.tenantId, form);
      if (onSaved) onSaved();
      if (onClose) onClose();
    } catch (e) {
      setError(e.message || "Failed to update tenant info");
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={2} minWidth={350}>
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
        label="Domain"
        name="domain"
        value={form.domain}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        disabled={loading}
      />
      <TextField
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={loading}
      />
      <FormControlLabel
        control={
          <Switch
            checked={form.enabled}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, enabled: e.target.checked }))
            }
            name="enabled"
            color="primary"
            disabled={loading}
          />
        }
        label="Enabled"
      />
      <Box mt={2} display="flex" gap={2}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          Save
        </Button>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
