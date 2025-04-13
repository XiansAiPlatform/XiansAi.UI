import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    List,
    ListItemText,
    ListItemButton,
    Divider,
    Badge,
    useTheme,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import SendMessageForm from './SendMessageForm';
import { useSlider } from '../../contexts/SliderContext';

/**
 * Displays a list of conversation threads for a selected workflow
 * 
 * @param {Object} props
 * @param {string} props.selectedWorkflowId - ID of the workflow to fetch threads for
 * @param {Object} props.messagingApi - API hook for messaging operations
 * @param {Function} props.showError - Function to display error notifications
 * @param {string} props.selectedThreadId - Currently selected thread ID
 * @param {Function} props.onThreadSelect - Callback when a thread is selected
 */
const ConversationThreads = ({ 
    selectedWorkflowId,
    messagingApi,
    showError,
    selectedThreadId,
    onThreadSelect
}) => {
    const theme = useTheme();
    const [threads, setThreads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { openSlider } = useSlider();

    // Function to handle opening the form in the slider
    const handleOpenForm = () => {
        openSlider(
            <SendMessageForm
                workflowId={selectedWorkflowId}
                onClose={handleMessageSent}
                onMessageSent={handleMessageSent}
            />,
            'New Conversation'
        );
    };

    // Function to refresh threads after sending a message
    const handleMessageSent = async () => {
        if (!selectedWorkflowId) return;
        
        setIsLoading(true);
        try {
            const fetchedThreads = await messagingApi.getThreads(selectedWorkflowId);
            setThreads(fetchedThreads || []);
        } catch (err) {
            showError(`Failed to refresh threads: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Don't fetch if no workflow is selected
        if (!selectedWorkflowId) {
            setThreads([]);
            setError(null);
            setIsLoading(false);
            return;
        }

        const fetchConversationThreads = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedThreads = await messagingApi.getThreads(selectedWorkflowId);
                setThreads(fetchedThreads || []);

                // Check if the currently selected thread still exists
                // If not, or if no thread was selected, select the first one if available
                const currentSelectionExists = fetchedThreads.some(t => t.id === selectedThreadId);
                if ((!selectedThreadId || !currentSelectionExists) && fetchedThreads.length > 0) {
                     // Pass both the ID and the full thread object
                     onThreadSelect(fetchedThreads[0].id, fetchedThreads[0]); 
                }
            } catch (err) {
                const errorMsg = 'Failed to fetch conversation threads.';
                setError(errorMsg);
                showError(`${errorMsg}: ${err.message}`);
                console.error(err);
                setThreads([]);
                onThreadSelect(null); // Deselect thread on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversationThreads();
        // Dependency array ensures refetch when workflow ID, api, or notification changes
    }, [selectedWorkflowId, messagingApi, showError, onThreadSelect, selectedThreadId]);

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: 3 
            }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <Paper 
            sx={{
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: theme.shape.borderRadius,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ 
                    p: 2, 
                    borderBottom: '1px solid', 
                    borderColor: theme.palette.divider,
                    backgroundColor: theme.palette.background.paper,
                    borderTopLeftRadius: `calc(${theme.shape.borderRadius}px - 1px)`,
                    borderTopRightRadius: `calc(${theme.shape.borderRadius}px - 1px)`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Conversations
                </Typography>
                <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={handleOpenForm}
                    disabled={!selectedWorkflowId}
                    title="Start new conversation"
                >
                    <AddIcon />
                </IconButton>
            </Box>
            
            <Box sx={{ flex: '1 1 auto' }}>
                {error && (
                     <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <Typography color="error" align="center">
                             {error}
                         </Typography>
                     </Box>
                )}
                {!error && threads.length === 0 && !isLoading && (
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography color="text.secondary" align="center">
                            No conversation threads found
                        </Typography>
                    </Box>
                )}
                {!error && threads.length > 0 && (
                    <List disablePadding>
                        {threads.map(thread => (
                            <React.Fragment key={thread.id}>
                                <ListItemButton 
                                    selected={selectedThreadId === thread.id}
                                    // Pass both the ID and the full thread object on click
                                    onClick={() => onThreadSelect(thread.id, thread)} 
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        '&.Mui-selected': {
                                            bgcolor: theme.palette.action.selected,
                                            borderLeft: '3px solid',
                                            borderLeftColor: theme.palette.primary.main,
                                            '&:hover': {
                                                bgcolor: theme.palette.action.hover
                                            }
                                        }
                                    }}
                                >
                                    <ListItemText 
                                        primary={thread.participantId || thread.title || `Thread ${thread.id.slice(-4)}`}
                                        secondary={thread.updatedAt ? format(new Date(thread.updatedAt), 'MMM d, yyyy h:mm a') : 'No date'}
                                        primaryTypographyProps={{
                                            fontWeight: selectedThreadId === thread.id ? 'bold' : 'medium',
                                            variant: 'body2',
                                            noWrap: true
                                        }}
                                        secondaryTypographyProps={{
                                            variant: 'caption',
                                            noWrap: true
                                        }}
                                        sx={{ mr: 1 }}
                                    />
                                    {thread.messageCount > 0 && (
                                        <Badge 
                                            badgeContent={thread.messageCount} 
                                            color="primary"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    fontSize: '0.7rem'
                                                }
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Box>
        </Paper>
    );
};

export default ConversationThreads; 