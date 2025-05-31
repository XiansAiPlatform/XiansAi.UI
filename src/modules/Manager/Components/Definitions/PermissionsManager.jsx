import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Alert,
  Collapse,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { usePermissionsApi } from '../../services/permissions-api';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';

const PERMISSION_LEVELS = {
  OWNER: {
    value: 'ownerAccess',
    label: 'Owner',
    description: 'Can view, edit, delete, and manage permissions'
  },
  WRITE: {
    value: 'writeAccess',
    label: 'Can Write',
    description: 'Can view and edit definitions'
  },
  READ: {
    value: 'readAccess',
    label: 'Can Read',
    description: 'Can only view definitions'
  }
};

const PermissionsManager = ({ agentName }) => {
  const [permissions, setPermissions] = useState({
    ownerAccess: [],
    writeAccess: [],
    readAccess: []
  });
  const [newUserId, setNewUserId] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('readAccess');
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const permissionsApi = usePermissionsApi();
  const { setLoading } = useLoading();
  const { showSuccess } = useNotification();

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await permissionsApi.getPermissions(agentName);
      if (!response || response.errorMessage) {
        setError(response?.errorMessage || 'Failed to fetch permissions');
        return;
      }

      setPermissions(response || {
        ownerAccess: [],
        writeAccess: [],
        readAccess: []
      });
    } catch (error) {
      setError('Failed to fetch permissions. Please try again later.');
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [agentName, permissionsApi, setLoading]);

  useEffect(() => {
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentName]);

  const handleAddUser = async () => {
    if (!newUserId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await permissionsApi.addUser(agentName, newUserId, selectedPermission);
      if (!response || response.errorMessage) {
        setError(response.errorMessage || 'Failed to add user');
        return;
      }

      await fetchPermissions();
      setNewUserId('');
      showSuccess('User added successfully');
    } catch (error) {
      setError('Failed to add user. Please try again.');
      console.error('Error adding user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Prevent removing the last owner
      if (permissions.ownerAccess.includes(userId) && permissions.ownerAccess.length === 1) {
        setError('Cannot remove the last owner');
        return;
      }

      const response = await permissionsApi.removeUser(agentName, userId);
      if (!response || response.errorMessage) {
        setError(response.errorMessage || 'Failed to remove user');
        return;
      }

      await fetchPermissions();
      showSuccess('User removed successfully');
    } catch (error) {
      setError('Failed to remove user. Please try again.');
      console.error('Error removing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (userId, currentPermission, newPermission) => {
    try {
      setLoading(true);
      setError(null);
      // Prevent changing the last owner's permission
      if (currentPermission === 'ownerAccess' && permissions.ownerAccess.length === 1) {
        setError('Cannot change the last owner\'s permission level');
        return;
      }
      // First remove from current permission level
      const removeResponse = await permissionsApi.removeUser(agentName, userId);
      if (!removeResponse.isSuccess) {
        setError(removeResponse.errorMessage || 'Failed to update permission');
        return;
      }
      // Then add to new permission level
      const addResponse = await permissionsApi.addUser(agentName, userId, newPermission);
      if (!addResponse.isSuccess) {
        setError(addResponse.errorMessage || 'Failed to update permission');
        return;
      }
      await fetchPermissions();
      showSuccess('Permission updated successfully');
    } catch (error) {
      setError('Failed to update permission. Please try again.');
      console.error('Error updating permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPermissionList = (users, permissionLevel) => (
    <List>
      {users.map((userId) => (
        <ListItem key={userId}>
          <ListItemText primary={userId} />
          <ListItemSecondaryAction>
            <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
              <Select
                value={permissionLevel}
                onChange={(e) => handleUpdatePermission(userId, permissionLevel, e.target.value)}
                disabled={permissionLevel === 'ownerAccess' && users.length === 1}
              >
                {Object.values(PERMISSION_LEVELS).map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Remove user">
              <IconButton
                edge="end"
                onClick={() => handleRemoveUser(userId)}
                disabled={permissionLevel === 'ownerAccess' && users.length === 1}
                sx={{
                  '&.Mui-disabled': {
                    color: 'text.disabled',
                    opacity: 0.5
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Manage Permissions for {agentName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Add New User
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            size="small"
            label="User ID"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="e.g., github|123456"
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Permission</InputLabel>
            <Select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              label="Permission Level"
            >
              {Object.values(PERMISSION_LEVELS).map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleAddUser}
            disabled={!newUserId.trim()}
          >
            Add User
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">Permission Levels</Typography>
        <Button
          size="small"
          endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowDetails(!showDetails)}
          sx={{ ml: 2 }}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
      </Box>

      {Object.entries(PERMISSION_LEVELS).map(([key, level]) => (
        <Box key={key} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              {level.label}
            </Typography>
            <Chip
              label={`${permissions[level.value]?.length || 0} users`}
              size="small"
            />
          </Box>
          <Collapse in={showDetails}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {level.description}
            </Typography>
          </Collapse>
          {renderPermissionList(permissions[level.value] || [], level.value)}
        </Box>
      ))}
    </Box>
  );
};

export default PermissionsManager; 