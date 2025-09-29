import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { ContentCopy, Autorenew, Delete } from "@mui/icons-material";
import { useApiKeyApi } from "../../services/apikey-api";
import { useTenant } from "../../contexts/TenantContext";

const ApiKeySettings = () => {
  const api = useApiKeyApi();
  const { userRoles, isLoading: tenantLoading } = useTenant();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [newKey, setNewKey] = useState(null);
  const [revokeLoading, setRevokeLoading] = useState({});
  const [rotateLoading, setRotateLoading] = useState({});
  const [rotateKey, setRotateKey] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState(null);

  const hasAccess = userRoles.includes("SysAdmin") || userRoles.includes("TenantAdmin");

  const fetchApiKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listApiKeys();
      console.log("Fetched API keys:", res); //testing
      setApiKeys(res || []);
    } catch (err) {
      setError("Failed to load API keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) fetchApiKeys();
    // eslint-disable-next-line
  }, [hasAccess]);

  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
    setCreateName("");
    setCreateError(null);
    setNewKey(null);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setCreateName("");
    setCreateError(null);
    setNewKey(null);
  };

  const handleCreateApiKey = async () => {
    if (!createName.trim()) {
      setCreateError("Name is required.");
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const res = await api.createApiKey(createName.trim());
      setNewKey(res?.apiKey || null);
      console.log("Created API key:", res); //testing
      await fetchApiKeys();
    } catch (err) {
      console.error("Error creating API key:", err); //testing
      setCreateError(err?.message || "Failed to create API key.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRevokeClick = (key) => {
    setKeyToRevoke(key);
    setDeleteConfirmOpen(true);
  };

  const handleRevokeCancel = () => {
    setDeleteConfirmOpen(false);
    setKeyToRevoke(null);
  };

  const handleRevokeApiKey = async () => {
    if (!keyToRevoke) return;
    setRevokeLoading((prev) => ({ ...prev, [keyToRevoke.id]: true }));
    try {
      await api.revokeApiKey(keyToRevoke.id);
      await fetchApiKeys();
      setDeleteConfirmOpen(false);
      setKeyToRevoke(null);
    } catch (err) {
      setError("Failed to revoke API key.");
    } finally {
      setRevokeLoading((prev) => ({ ...prev, [keyToRevoke.id]: false }));
    }
  };

  const handleRotateApiKey = async (key) => {
    setRotateLoading((prev) => ({ ...prev, [key.id]: true }));
    setRotateKey(null);
    try {
      const res = await api.rotateApiKey(key.id);
      console.log("Rotated API key:", res); //testing
      setRotateKey({
        apiKey: res?.apiKey, 
        id: key.id,
        name: key.name
      });
      await fetchApiKeys();
    } catch (err) {
      setError("Failed to rotate API key.");
    } finally {
      setRotateLoading((prev) => ({ ...prev, [key.id]: false }));
    }
  };

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
  };

  if (tenantLoading) {
    return (
      <Paper className="ca-certificates-paper">
        <Typography variant="h6" gutterBottom>
          API Key Management
        </Typography>
        <Box sx={{ height: "200px" }}><CircularProgress /></Box>
      </Paper>
    );
  }
  if (!hasAccess) {
    return (
      <Paper className="ca-certificates-paper">
        <Typography variant="h6" gutterBottom>
          API Key Management
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>You do not have permission to view this page.</Alert>
      </Paper>
    );
  }
  if (loading) {
    return (
      <Paper className="ca-certificates-paper">
        <Typography variant="h6" gutterBottom>
          API Key Management
        </Typography>
        <Box sx={{ height: "200px" }}><CircularProgress /></Box>
      </Paper>
    );
  }
  if (error) {
    return (
      <Paper className="ca-certificates-paper">
        <Typography variant="h6" gutterBottom>
          API Key Management
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper className="ca-certificates-paper">
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Key Management
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreateDialogOpen}>
          Create API Key
        </Button>
      </Box>
      <Box>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Total API Keys: {apiKeys.length}
        </Typography>
        {apiKeys.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No API keys found.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Last Rotated</TableCell>                  
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.name}</TableCell>
                    <TableCell>{key.createdAt ? new Date(key.createdAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>{key.createdBy || "-"}</TableCell>
                    <TableCell>{key.lastRotatedAt ? new Date(key.lastRotatedAt).toLocaleString() : "-"}</TableCell>                    
                    <TableCell align="right">
                      <Tooltip title="Rotate">
                        <span>
                          <IconButton
                            onClick={() => handleRotateApiKey(key)}
                            disabled={!!key.revokedAt || rotateLoading[key.id]}
                            size="small"
                          >
                            {rotateLoading[key.id] ? <CircularProgress size={18} /> : <Autorenew />}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Revoke">
                        <span>
                          <IconButton
                            onClick={() => handleRevokeClick(key)}
                            disabled={!!key.revokedAt || revokeLoading[key.id]}
                            size="small"
                          >
                            {revokeLoading[key.id] ? <CircularProgress size={18} /> : <Delete />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent sx={{ pl: 3, pr: 3 }}>
          {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
          {newKey ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
                <span style={{ fontWeight: 600 }}>API Key:</span>
                <Box display="flex" gap={1} sx={{ backgroundColor: 'white', padding: 1, borderRadius: 1 }}>
                  <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{newKey}</span>
                  <Tooltip title="Copy">
                    <IconButton size="small" onClick={() => handleCopy(newKey)}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Please copy and store this key securely. You will not be able to see it again.
              </Typography>
            </Alert>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              label="API Key Name"
              type="text"
              fullWidth
              variant="outlined"
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ pl: 3, pr: 3, justifyContent: 'flex-end', alignContent: 'start' }}>
          {newKey ? (
            <Button onClick={handleCreateDialogClose} disabled={createLoading} variant="contained">Close</Button>
          ) : (
            <>
              <Button onClick={handleCreateDialogClose} disabled={createLoading}>Cancel</Button>
              <Button
                onClick={handleCreateApiKey}
                variant="contained"
                disabled={createLoading || !createName.trim()}
              >
                {createLoading ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={16} /> Creating...</Box> : 'Create API Key'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Rotate API Key Dialog */}
      <Dialog open={!!rotateKey} onClose={() => setRotateKey(null)} maxWidth="sm" fullWidth>
        <DialogTitle>API Key Rotated</DialogTitle>
        <DialogContent sx={{ pl: 3, pr: 3 }}>
          {rotateKey && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
                <span style={{ fontWeight: 600 }}>New API Key:</span>
                <Box display="flex" gap={1} sx={{ backgroundColor: 'white', padding: 1, borderRadius: 1 }}>
                  <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{rotateKey.apiKey}</span>
                  <Tooltip title="Copy">
                    <IconButton size="small" onClick={() => handleCopy(rotateKey.apiKey)}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Please copy and store this key securely. You will not be able to see it again.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ pl: 3, pr: 3, justifyContent: 'flex-end', alignContent:'start'}}>
          <Button onClick={() => setRotateKey(null)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Revoke API Key Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleRevokeCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Revoke API Key</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to revoke this API key?
          </Typography>
          {keyToRevoke && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{keyToRevoke.name}</Typography>
              <Typography variant="body2" color="text.secondary">ID: {keyToRevoke.id}</Typography>
            </Paper>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. The API key will be permanently revoked.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRevokeCancel} disabled={revokeLoading[keyToRevoke?.id]}>Cancel</Button>
          <Button
            onClick={handleRevokeApiKey}
            variant="contained"
            color="error"
            disabled={revokeLoading[keyToRevoke?.id]}
          >
            {revokeLoading[keyToRevoke?.id] ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={16} /> Revoking...</Box> : 'Revoke'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ApiKeySettings;
