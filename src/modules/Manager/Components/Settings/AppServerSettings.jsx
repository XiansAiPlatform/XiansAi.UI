import { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  IconButton,
  Tooltip
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

  const generateApiKey = async () => {
    setIsLoading(true);
    try {
      const response = await api.generateApiKey();
      console.log(response);
      setApiKey(response.certificate);
      showSuccess('Agent API Key generated successfully');
    } catch (error) {
      await handleApiError(error, 'Failed to generate Agent API key', showError);
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
    setConfirmDialogOpen(true);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TextField
            label="Server URL"
            value={apiBaseUrl}
            fullWidth
            InputProps={{ 
              readOnly: true,
              className: 'readonly-input'
            }}
            className="app-server-url"
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
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <TextField
            label="Agent API Key"
            value={apiKey}
            fullWidth
            multiline
            rows={3}
            InputProps={{ readOnly: true }}
            className="input-field"
          />
          <Tooltip title="Copy Agent API Key">
            <span>
              <IconButton 
                onClick={() => handleCopy(apiKey, 'Agent API Key')}
                size="small"
                sx={{ mt: 1 }}
                disabled={!apiKey}
              >
                <ContentCopyIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Button
          variant="contained"
          onClick={handleGenerateClick}
          disabled={isLoading}
          className="submit-button"
          size="small"
          sx={{ alignSelf: 'flex-start' }}
        >
          {isLoading ? 'Generating...' : 'Generate New Agent API Key'}
        </Button>
        <ConfirmationDialog
          open={confirmDialogOpen}
          title="Generate New Agent API Key?"
          message={
            'Generating a new Agent API Key will invalidate all previously generated keys. Are you sure you want to continue?'
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
