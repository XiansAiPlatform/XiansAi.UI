import { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSettingsApi } from '../../services/settings-api';
import { useNotification } from '../../contexts/NotificationContext';
import { handleApiError } from '../../utils/errorHandler';
import './Settings.css';
import { getConfig } from '../../../../config';
import ConfirmationDialog from '../Common/ConfirmationDialog';

const AppServerSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const api = useSettingsApi();
  const { apiBaseUrl } = getConfig();
  const [apiKey, setApiKey] = useState('');
  const { showError, showSuccess } = useNotification();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [revokeOldKeys, setRevokeOldKeys] = useState(true);

  const generateApiKey = async () => {
    setIsLoading(true);
    try {
      const response = await api.generateApiKey(revokeOldKeys);
      console.log(response);
      setApiKey(response.certificate);
      showSuccess('Agent Certificate generated successfully');
    } catch (error) {
      await handleApiError(error, 'Failed to generate Agent Certificate', showError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(`${label} copied to clipboard`);
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };

  const handleGenerateClick = () => {
    if (revokeOldKeys) {
      setConfirmDialogOpen(true);
    } else {
      generateApiKey();
    }
  };

  const handleConfirmGenerate = async () => {
    setConfirmDialogOpen(false);
    await generateApiKey();
  };

  const handleCancelGenerate = () => {
    setConfirmDialogOpen(false);
  };

  return (
    <Paper className="ca-certificates-paper">
      <Typography variant="h6" gutterBottom>
        Agent Settings
      </Typography>

      <Box className="server-url-container">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TextField
            label="Server URL"
            value={apiBaseUrl}
            fullWidth
            InputProps={{ 
              readOnly: true,
              className: 'readonly-input'
            }}
            className="app-server-url"
            size="small"
          />
          <Tooltip title="Copy URL">
            <IconButton 
              onClick={() => handleCopy(apiBaseUrl, 'Server URL')}
              size="small"
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box className="form-container">
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <TextField
            label="Agent Certificate"
            value={apiKey}
            fullWidth
            multiline
            rows={2}
            InputProps={{ readOnly: true }}
            className="input-field"
            size="small"
          />
          <Tooltip title="Copy Agent Certificate">
            <span>
              <IconButton 
                onClick={() => handleCopy(apiKey, 'Agent Certificate')}
                size="small"
                sx={{ mt: 0.5 }}
                disabled={!apiKey}
              >
                <ContentCopyIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5 }}>
          <Button
            variant="contained"
            onClick={handleGenerateClick}
            disabled={isLoading}
            className="submit-button"
            size="small"
          >
            {isLoading ? 'Generating...' : 'Generate New Agent Certificate'}
          </Button>
          <FormControlLabel sx={{ mt: 2 }}
            control={
              <Checkbox
                checked={revokeOldKeys}
                onChange={(e) => setRevokeOldKeys(e.target.checked)}
                size="small"
              />
            }
            label="Revoke Old Keys"
          />
        </Box>
        <ConfirmationDialog
          open={confirmDialogOpen}
          title="Generate New Agent Certificate?"
          message={
            'Generating a new Agent Certificate will invalidate all previously generated certificates. Are you sure you want to continue?'
          }
          confirmLabel="Generate"
          cancelLabel="Cancel"
          severity="warning"
          onConfirm={handleConfirmGenerate}
          onCancel={handleCancelGenerate}
        />
      </Box>
    </Paper>
  );
};

export default AppServerSettings;
