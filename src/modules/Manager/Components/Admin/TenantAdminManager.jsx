import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useRolesApi } from "../../services/roles-api";
import { useUserApi } from "../../services/user-api";
import { useAuth } from "../../auth/AuthContext";

export default function TenantAdminManager({ tenant, onClose, onChanged }) {
  const { getAccessTokenSilently } = useAuth();
  const rolesApi = useRolesApi();
  const userApi = useUserApi();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState({});
  const tenantId = tenant.id || tenant.tenantId;
  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await rolesApi.getTenantAdmins(tenant.tenantId);
      setAdmins(result.data || result);
    } catch (e) {
      setError("Failed to fetch admins");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line
  }, [tenantId]);

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    if (e.target.value.length < 2) {
      setUserResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const results = await userApi.searchUsers(token, e.target.value);
      setUserResults(results.data || results);
    } catch (e) {
      setUserResults([]);
    }
    setSearchLoading(false);
  };

  const handleAddAdmin = async (user) => {
    setAddLoading(true);
    setError("");
    try {
      await rolesApi.addTenantAdmin(tenant.tenantId, user.userId || user.id);
      setSuccess("Admin added successfully");
      setSearch("");
      setUserResults([]);
      fetchAdmins();
      if (onChanged) onChanged();
    } catch (e) {
      setError("Failed to add admin");
    }
    setAddLoading(false);
  };

  const handleRemoveAdmin = async (admin) => {
    setRemoveLoading((prev) => ({ ...prev, [admin.userId || admin.id]: true }));
    setError("");
    try {
      await rolesApi.removeTenantAdmin(tenant.tenantId, admin.userId || admin.id);
      setSuccess("Admin removed successfully");
      fetchAdmins();
      if (onChanged) onChanged();
    } catch (e) {
      setError("Failed to remove admin");
    }
    setRemoveLoading((prev) => ({
      ...prev,
      [admin.userId || admin.id]: false,
    }));
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Admins for {tenant.name}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <List dense>
          {admins.length === 0 && (
            <ListItem>
              <ListItemText primary="No admins found." />
            </ListItem>
          )}
          {admins.map((admin) => (
            <ListItem
              key={admin.userId || admin.id}
              secondaryAction={
                <Tooltip title="Remove Admin">
                  <span>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleRemoveAdmin(admin)}
                      disabled={removeLoading[admin.userId || admin.id]}
                    >
                      {removeLoading[admin.userId || admin.id] ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DeleteIcon />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              }
            >
              <ListItemText
                primary={admin.name || admin.userId || admin.id}
                secondary={admin.email || admin.nickname || null}
              />
            </ListItem>
          ))}
        </List>
      )}
      <Box mt={3}>
        <Typography variant="subtitle1">Add Admin</Typography>
        <TextField
          label="Search user"
          value={search}
          onChange={handleSearch}
          fullWidth
          size="small"
          sx={{ mt: 1, mb: 1 }}
        />
        {searchLoading && <CircularProgress size={20} />}
        {userResults.length > 0 && (
          <List dense>
            {userResults.map((user) => (
              <ListItem
                key={user.userId || user.id}
                secondaryAction={
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddAdmin(user)}
                    disabled={addLoading}
                  >
                    Add
                  </Button>
                }
              >
                <ListItemText
                  primary={user.name || user.userId || user.id}
                  secondary={user.email || user.nickname || null}
                />
              </ListItem>
            ))}
          </List>
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
    </Box>
  );
}
