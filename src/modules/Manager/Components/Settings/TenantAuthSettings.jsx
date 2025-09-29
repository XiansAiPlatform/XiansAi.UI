import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import Editor from '@monaco-editor/react';
import { useOidcConfigApi } from '../../services/oidc-config-api';
import { useSelectedOrg } from '../../contexts/OrganizationContext';
import { useNotification } from '../../contexts/NotificationContext';
import ConfirmationDialog from '../Common/ConfirmationDialog';

const exampleConfig = `{
  "allowedProviders": ["google", "microsoft"],
  "providers": {
    "google": {
      "authority": "https://accounts.google.com",
      "issuer": "https://accounts.google.com",
      "expectedAudience": ["your-google-client-id.apps.googleusercontent.com"],
      "scope": "openid profile email",
      "requireSignedTokens": true,
      "acceptedAlgorithms": ["RS256"],
      "requireHttpsMetadata": true,
      "additionalClaims": [
        { "claim": "hd", "op": "equals", "value": "company.com" }
      ],
      "providerSpecificSettings": {
        "useHostedDomainCheck": true
      }
    },
    "microsoft": {
      "authority": "https://login.microsoftonline.com/common/v2.0",
      "issuer": "https://login.microsoftonline.com/{tenant}/v2.0",
      "expectedAudience": ["api://my-api", "account"],
      "scope": "openid profile email",
      "requireSignedTokens": true,
      "acceptedAlgorithms": ["RS256", "RS384"],
      "requireHttpsMetadata": true,
      "additionalClaims": [],
      "providerSpecificSettings": {
        "preferredTokenType": "id_token"
      }
    }
  },
  "notes": "Accept only google & microsoft issued tokens with detailed per-provider config."
}`;

const TenantAuthSettings = () => {
  const api = useOidcConfigApi();
  const { selectedOrg } = useSelectedOrg();
  const { showError, showSuccess } = useNotification();

  const [isLoading, setIsLoading] = useState(true);
  const [existingConfig, setExistingConfig] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorValue, setEditorValue] = useState('');
  const [hasMarkers, setHasMarkers] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const prettyExisting = useMemo(() => existingConfig ? JSON.stringify(existingConfig, null, 2) : '', [existingConfig]);
  const isParsable = useMemo(() => {
    try {
      JSON.parse(editorValue || '{}');
      return true;
    } catch {
      return false;
    }
  }, [editorValue]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const cfg = await api.getTenantConfig();
        setExistingConfig(cfg);
      } catch (e) {
        showError(e?.message || 'Failed to load OIDC config');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [api, showError]);

  const startCreate = () => {
    setIsEditing(true);
    setEditorValue(exampleConfig);
  };

  const startEdit = () => {
    setIsEditing(true);
    setEditorValue(prettyExisting || exampleConfig);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const onSave = async () => {
    try {
      let parsed;
      try {
        parsed = JSON.parse(editorValue || '{}');
      } catch (err) {
        showError('Configuration must be valid JSON');
        return;
      }

      // Inject tenantId as requested
      parsed.tenantId = selectedOrg;

      if (existingConfig) {
        await api.updateTenantConfig(parsed);
        showSuccess('OIDC configuration updated');
      } else {
        await api.createTenantConfig(parsed);
        showSuccess('OIDC configuration created');
      }

      // Refresh
      const fresh = await api.getTenantConfig();
      setExistingConfig(fresh);
      setIsEditing(false);
    } catch (e) {
      showError(e?.message || 'Failed to save configuration');
    }
  };

  const onDelete = async () => {
    try {
      await api.deleteTenantConfig();
      setExistingConfig(null);
      setIsEditing(false);
      showSuccess('OIDC configuration deleted');
    } catch (e) {
      showError(e?.message || 'Failed to delete configuration');
    }
  };

  return (
    <Paper className="ca-certificates-paper">
      <Typography variant="h6" gutterBottom>
        OIDC Configuration on User2Agent Interactions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manages the tenant-scoped OIDC token acceptance for User2Agent interactions.
      </Typography>
      <Stack spacing={3}>

        {!isLoading && !existingConfig && !isEditing && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body1">No configuration found for tenant <strong>{selectedOrg}</strong>.</Typography>
            <Button variant="contained" onClick={startCreate}>Create configuration</Button>
          </Stack>
        )}

        {!isLoading && existingConfig && !isEditing && (
          <Stack spacing={2}>
            <TextField
              label="Current configuration (read-only)"
              value={prettyExisting}
              multiline
              minRows={14}
              InputProps={{ readOnly: true }}
              className="readonly-code-input"
            />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={startEdit}>Edit</Button>
              <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>Delete</Button>
            </Stack>
          </Stack>
        )}

        {isEditing && (
          <Stack spacing={2}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <Editor
                height="420px"
                language="json"
                value={editorValue}
                onChange={(val) => setEditorValue(val ?? '')}
                onValidate={(markers) => setHasMarkers(!!markers && markers.length > 0)}
                options={{
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  // Monaco supports placeholder in recent versions
                  placeholder: exampleConfig,
                }}
                onMount={(editor, monaco) => {
                  const providerSchema = {
                    type: 'object',
                    additionalProperties: false,
                    required: ['issuer'],
                    properties: {
                      authority: { type: ['string', 'null'] },
                      issuer: { type: 'string' },
                      expectedAudience: { type: ['array', 'null'], items: { type: 'string' } },
                      scope: { type: ['string', 'null'] },
                      requireSignedTokens: { type: ['boolean', 'null'] },
                      acceptedAlgorithms: { type: ['array', 'null'], items: { type: 'string' } },
                      requireHttpsMetadata: { type: ['boolean', 'null'] },
                      additionalClaims: { type: ['array', 'null'] },
                      providerSpecificSettings: { type: ['object', 'null'] }
                    }
                  };

                  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                    validate: true,
                    allowComments: false,
                    enableSchemaRequest: false,
                    schemas: [
                      {
                        uri: 'inmemory://model/oidc-config-schema.json',
                        fileMatch: ['*'],
                        schema: {
                          type: 'object',
                          additionalProperties: false,
                          required: ['allowedProviders', 'providers'],
                          properties: {
                            allowedProviders: {
                              type: 'array',
                              items: { type: 'string' }
                            },
                            providers: {
                              type: 'object',
                              additionalProperties: providerSchema
                            },
                            notes: { type: ['string', 'null'] },
                            tenantId: { type: ['string', 'null'] }
                          }
                        }
                      }
                    ]
                  });
                }}
              />
            </Box>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={onSave} disabled={hasMarkers || !isParsable}>Save</Button>
              <Button variant="outlined" onClick={cancelEdit}>Cancel</Button>
            </Stack>
          </Stack>
        )}
      </Stack>
      <ConfirmationDialog
        open={confirmOpen}
        title="Delete OIDC configuration"
        message={`Are you sure you want to delete the OIDC configuration for tenant "${selectedOrg}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        severity="error"
        onConfirm={async () => {
          setConfirmOpen(false);
          await onDelete();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Paper>
  );
};

export default TenantAuthSettings;

