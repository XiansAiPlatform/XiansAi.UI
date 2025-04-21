import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useWorkflowApi } from '../../services/workflow-api';
import { useNotification } from '../../contexts/NotificationContext';

const RegisterWebhookForm = ({ workflowId, onClose }) => {
    const [url, setUrl] = useState('');
    const [eventName, setEventName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [registeredWebhooks, setRegisteredWebhooks] = useState([]);
    const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true);
    const workflowApi = useWorkflowApi();
    const { showError, showSuccess } = useNotification();

    useEffect(() => {
        const fetchWebhooks = async () => {
            setIsLoadingWebhooks(true);
            try {
                const hooks = await workflowApi.getWebhooks(workflowId);
                setRegisteredWebhooks(hooks);
            } catch (error) {
                showError(`Error fetching webhooks: ${error.message}`);
                setRegisteredWebhooks([]);
            } finally {
                setIsLoadingWebhooks(false);
            }
        };
        fetchWebhooks();
    }, [workflowId, workflowApi, showError]);

    const handleRegister = async () => {
        setIsRegistering(true);
        if (!url) {
            showError('Webhook URL is required');
            setIsRegistering(false);
            return;
        }
        try {
            const newWebhook = await workflowApi.registerWebhook(workflowId, url, eventName || null);
            showSuccess(`Webhook registered successfully! (ID: ${newWebhook.id})`);
            setRegisteredWebhooks(prev => [...prev, newWebhook]);
            setUrl('');
            setEventName('');
        } catch (error) {
            showError(`Error registering webhook: ${error.message}`);
        } finally {
            setIsRegistering(false);
        }
    };

    const handleDeleteWebhook = async (webhookId) => {
        try {
            await workflowApi.deleteWebhook(workflowId, webhookId);
            showSuccess(`Webhook deleted successfully!`);
            setRegisteredWebhooks(prev => prev.filter(hook => hook.id !== webhookId));
        } catch (error) {
            showError(`Error deleting webhook: ${error.message}`);
        }
    };


    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Register Webhook for {workflowId}</Typography>
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1">Registered Webhooks:</Typography>
                {isLoadingWebhooks ? <CircularProgress size={20} /> :
                    registeredWebhooks.length > 0 ? (
                        <List dense>
                            {registeredWebhooks.map(hook => (
                                <ListItem
                                    key={hook.id}
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteWebhook(hook.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={hook.url}
                                        secondary={hook.eventName ? `Event: ${hook.eventName}` : 'All Events'}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="textSecondary">No webhooks registered yet.</Typography>
                    )
                }
                <Divider sx={{ my: 2 }} />
            </Box>

            <TextField
                label="Webhook URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
                margin="normal"
                required
                disabled={isRegistering}
            />
            <TextField
                label="Event Name (Optional)"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                fullWidth
                margin="normal"
                helperText="Leave blank to subscribe to all events"
                disabled={isRegistering}
            />
            <Button
                variant="contained"
                onClick={handleRegister}
                disabled={!url || isRegistering}
                sx={{ mt: 2 }}
            >
                {isRegistering ? <CircularProgress size={24} /> : 'Register Webhook'}
            </Button>
        </Box>
    );
};

export default RegisterWebhookForm; 