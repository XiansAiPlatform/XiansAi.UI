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
  const tenantId = tenant.tenantId || tenant.id || "";

  const [form, setForm] = useState({
    name: tenant.name || "",
    domain: tenant.domain || "",
    description: tenant.description || "",
    timezone: tenant.timezone || "",
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
        label="Tenant ID"
        value={tenantId}
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
        disabled
        helperText="Tenant ID cannot be changed"
      />
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
        label="Domain (Optional)"
        name="domain"
        value={form.domain}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={loading}
        helperText="Email domain associated with this tenant. if Specified any user from that domain can login to AgentStudio automatically."
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
      <TextField
        label="Timezone"
        name="timezone"
        value={form.timezone}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={loading}
        helperText="e.g. America/New_York, Europe/London, UTC"
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
