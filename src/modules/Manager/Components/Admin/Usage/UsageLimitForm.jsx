import { useState } from 'react';
import { Box, Stack, TextField, Button, MenuItem, Typography } from '@mui/material';

const defaultValues = {
  tenantId: '',
  userId: '',
  maxTokens: 0,
  windowSeconds: 86400,
  enabled: true,
};

const UsageLimitForm = ({ mode = 'tenant', initialValues = {}, onSubmit, onCancel }) => {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [submitting, setSubmitting] = useState(false);
  const isOverride = mode === 'override';

  const handleChange = (field) => (event) => {
    const value = field === 'enabled' ? event.target.value === 'true' : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ minWidth: 320 }}>
      <Stack spacing={2}>
        {isOverride && (
          <TextField
            label="User ID"
            value={form.userId}
            onChange={handleChange('userId')}
            required
            placeholder="user@example.com"
          />
        )}

        <TextField
          label="Max Tokens"
          type="number"
          value={form.maxTokens}
          onChange={handleChange('maxTokens')}
          required
          inputProps={{ min: 0 }}
        />

        <TextField
          label="Window (seconds)"
          type="number"
          value={form.windowSeconds}
          onChange={handleChange('windowSeconds')}
          required
          helperText="86400 seconds = 24 hours"
          inputProps={{ min: 60 }}
        />

        <TextField
          select
          label="Status"
          value={form.enabled ? 'true' : 'false'}
          onChange={handleChange('enabled')}
        >
          <MenuItem value="true">Enabled</MenuItem>
          <MenuItem value="false">Disabled</MenuItem>
        </TextField>

        <Typography variant="caption" color="text.secondary">
          Changes take effect immediately and apply to new LLM calls. Existing workflows continue to completion.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default UsageLimitForm;

