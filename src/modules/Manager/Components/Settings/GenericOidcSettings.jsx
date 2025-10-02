import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography, CircularProgress } from '@mui/material';
import Editor from '@monaco-editor/react';
import { useGenericOidcApi } from '../../services/generic-oidc-api';
import { useSelectedOrg } from '../../contexts/OrganizationContext';
import { useNotification } from '../../contexts/NotificationContext';
import ConfirmationDialog from '../Common/ConfirmationDialog';

const exampleConfig = `{
  "allowedProviders": ["google", "okta", "auth0"],
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
        { "claim": "hd", "op": "equals", "value": "company.com" },
        { "claim": "email_verified", "op": "equals", "value": true }
      ],
      "providerSpecificSettings": {
        "useHostedDomainCheck": true
      }
    },
    "okta": {
      "authority": "https://dev-123456.okta.com/oauth2/default",
      "issuer": "https://dev-123456.okta.com/oauth2/default",
      "expectedAudience": ["api://my-api"],
      "scope": "openid profile email offline_access",
      "requireSignedTokens": true,
      "acceptedAlgorithms": ["RS256"],
      "requireHttpsMetadata": true
    },
    "auth0": {
      "authority": "https://company.auth0.com/",
      "issuer": "https://company.auth0.com/",
      "expectedAudience": ["https://api.company.com"],
      "scope": "openid profile email",
      "requireSignedTokens": true,
      "acceptedAlgorithms": ["RS256"],
      "requireHttpsMetadata": true
    }
  },
  "notes": "Generic OIDC configuration for multiple identity providers"
}`;

const GenericOidcSettings = () => {
  const api = useGenericOidcApi();
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
        const cfg = await api.getGenericOidcConfig();
        setExistingConfig(cfg);
      } catch (e) {
        showError(e?.message || 'Failed to load Generic OIDC configuration');
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

      // Inject tenantId automatically
      parsed.tenantId = selectedOrg;

      if (existingConfig) {
        await api.updateGenericOidcConfig(parsed);
        showSuccess('Generic OIDC configuration updated successfully');
      } else {
        await api.createGenericOidcConfig(parsed);
        showSuccess('Generic OIDC configuration created successfully');
      }

      // Refresh configuration
      const fresh = await api.getGenericOidcConfig();
      setExistingConfig(fresh);
      setIsEditing(false);
    } catch (e) {
      showError(e?.message || 'Failed to save Generic OIDC configuration');
    }
  };

  const onDelete = async () => {
    try {
      await api.deleteGenericOidcConfig();
      setExistingConfig(null);
      setIsEditing(false);
      showSuccess('Generic OIDC configuration deleted successfully');
    } catch (e) {
      showError(e?.message || 'Failed to delete Generic OIDC configuration');
    }
  };

  return (
    <Paper className="ca-certificates-paper">
      <Typography variant="h6" gutterBottom>
        Generic OIDC Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure multiple OIDC identity providers (Google, Okta, Auth0, Azure AD, etc.) for your tenant.
        This allows users to authenticate using any of the configured identity providers.
      </Typography>
      <Stack spacing={3}>

        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && !existingConfig && !isEditing && (
          <Stack spacing={2}>
            <Typography variant="body1">
              No Generic OIDC configuration found for tenant <strong>{selectedOrg}</strong>.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a configuration to enable authentication with external OIDC providers like Google, Okta, Auth0, Azure AD, and more.
            </Typography>
            <Box>
              <Button variant="contained" onClick={startCreate}>
                Create Configuration
              </Button>
            </Box>
          </Stack>
        )}

        {!isLoading && existingConfig && !isEditing && (
          <Stack spacing={2}>
            <TextField
              label="Current Configuration (Read-only)"
              value={prettyExisting}
              multiline
              minRows={14}
              maxRows={20}
              InputProps={{ readOnly: true }}
              className="readonly-code-input"
              sx={{ fontFamily: 'monospace' }}
            />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={startEdit}>
                Edit Configuration
              </Button>
              <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>
                Delete Configuration
              </Button>
            </Stack>
          </Stack>
        )}

        {isEditing && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Edit your Generic OIDC configuration below. The configuration must be valid JSON.
            </Typography>
            <Box sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 'var(--radius-lg)', 
              overflow: 'hidden' 
            }}>
              <Editor
                height="500px"
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
                  scrollBeyondLastLine: false,
                }}
                onMount={(editor, monaco) => {
                  const providerSchema = {
                    type: 'object',
                    additionalProperties: false,
                    required: ['issuer'],
                    properties: {
                      authority: { 
                        type: ['string', 'null'],
                        description: 'Base URL for OIDC discovery (e.g., https://accounts.google.com)'
                      },
                      issuer: { 
                        type: 'string',
                        description: 'Expected issuer value in JWT iss claim (required)'
                      },
                      expectedAudience: { 
                        type: ['array', 'null'], 
                        items: { type: 'string' },
                        description: 'Valid audience values for the token'
                      },
                      scope: { 
                        type: ['string', 'null'],
                        description: 'Required scopes (space-separated)'
                      },
                      requireSignedTokens: { 
                        type: ['boolean', 'null'],
                        description: 'Whether to require JWT signature validation (default: true)'
                      },
                      acceptedAlgorithms: { 
                        type: ['array', 'null'], 
                        items: { type: 'string' },
                        description: 'Allowed signing algorithms (e.g., ["RS256", "RS384"])'
                      },
                      requireHttpsMetadata: { 
                        type: ['boolean', 'null'],
                        description: 'Require HTTPS for metadata endpoint (default: true)'
                      },
                      additionalClaims: { 
                        type: ['array', 'null'],
                        description: 'Custom claim validation rules'
                      },
                      providerSpecificSettings: { 
                        type: ['object', 'null'],
                        description: 'Provider-specific configuration options'
                      }
                    }
                  };

                  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                    validate: true,
                    allowComments: false,
                    enableSchemaRequest: false,
                    schemas: [
                      {
                        uri: 'inmemory://model/generic-oidc-config-schema.json',
                        fileMatch: ['*'],
                        schema: {
                          type: 'object',
                          additionalProperties: false,
                          required: ['allowedProviders', 'providers'],
                          properties: {
                            allowedProviders: {
                              type: 'array',
                              items: { type: 'string' },
                              minItems: 1,
                              maxItems: 5,
                              description: 'List of provider names that are allowed (1-5 providers)'
                            },
                            providers: {
                              type: 'object',
                              additionalProperties: providerSchema,
                              description: 'Dictionary of OIDC provider configurations'
                            },
                            notes: { 
                              type: ['string', 'null'],
                              description: 'Optional notes about this configuration'
                            },
                            tenantId: { 
                              type: ['string', 'null'],
                              description: 'Tenant identifier (auto-injected)'
                            }
                          }
                        }
                      }
                    ]
                  });
                }}
              />
            </Box>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                onClick={onSave} 
                disabled={hasMarkers || !isParsable}
              >
                Save Configuration
              </Button>
              <Button variant="outlined" onClick={cancelEdit}>
                Cancel
              </Button>
            </Stack>
            {hasMarkers && (
              <Typography variant="caption" color="error">
                Please fix validation errors before saving
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
      <ConfirmationDialog
        open={confirmOpen}
        title="Delete Generic OIDC Configuration"
        message={`Are you sure you want to delete the Generic OIDC configuration for tenant "${selectedOrg}"? This will disable all configured OIDC providers and cannot be undone.`}
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

export default GenericOidcSettings;

