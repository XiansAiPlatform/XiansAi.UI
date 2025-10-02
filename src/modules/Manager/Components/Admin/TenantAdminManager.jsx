import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Paper,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import TuneIcon from "@mui/icons-material/Tune";
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
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <TuneIcon color="primary" />
        <Typography variant="h6">
          Admins for {tenant.name}
        </Typography>
        <Chip 
          label={`${admins.length} admin${admins.length !== 1 ? 's' : ''}`} 
          size="small" 
          color="primary" 
          variant="outlined" 
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={1} sx={{ mb: 3 }}>
          {admins.length === 0 ? (
            <Box p={3} textAlign="center">
              <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                No admins found for this tenant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add users as admins to give them management access
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {admins.map((admin, index) => (
                <React.Fragment key={admin.userId || admin.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                           {admin.name || admin.userId || admin.id}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          {admin.email && (
                            <Typography variant="body2" color="text.secondary">
                              {admin.email}
                            </Typography>
                          )}
                          {admin.nickname && admin.nickname !== admin.email && (
                            <Typography variant="caption" color="text.secondary">
                              {admin.nickname}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box ml={2}>
                      <Tooltip title="Remove Admin Access">
                        <span>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveAdmin(admin)}
                            disabled={removeLoading[admin.userId || admin.id]}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'error.light',
                                color: 'error.contrastText',
                              },
                            }}
                          >
                            {removeLoading[admin.userId || admin.id] ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </ListItem>
                  {index < admins.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      )}

      <Card elevation={1}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <AddIcon color="primary" />
            <Typography variant="h6">Add New Admin</Typography>
          </Box>
          <TextField
            label="Search for users to add as admin"
            placeholder="Type name or email..."
            value={search}
            onChange={handleSearch}
            fullWidth
            size="medium"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: searchLoading ? <CircularProgress size={20} /> : null,
            }}
          />
          {userResults.length > 0 && (
            <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
              <List disablePadding>
                {userResults.map((user, index) => (
                  <React.Fragment key={user.userId || user.id}>
                    <ListItem
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.light', width: 32, height: 32 }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1">
                            {user.name || user.userId || user.id}
                          </Typography>
                        }
                        secondary={user.email || user.nickname || null}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddAdmin(user)}
                        disabled={addLoading}
                        sx={{ ml: 1 }}
                      >
                        Add Admin
                      </Button>
                    </ListItem>
                    {index < userResults.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </CardContent>
      </Card>

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
