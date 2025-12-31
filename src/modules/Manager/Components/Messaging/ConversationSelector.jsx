import { useState, useEffect, useRef } from 'react';
import {
    TextField,
    Autocomplete,
    CircularProgress,
    Box,
    Typography,
    IconButton,
    Tooltip,
    Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { useLoading } from '../../contexts/LoadingContext';
import { handleApiError } from '../../utils/errorHandler';

/**
 * Dropdown selector for conversation threads
 * Replaces the left panel ConversationThreads component
 */
const ConversationSelector = ({
    selectedAgentName,
    messagingApi,
    showError,
    selectedThreadId,
    onThreadSelect,
    onNewConversation,
    refreshCounter = 0 // Accept refresh counter from parent
}) => {
    const [threads, setThreads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(50); // Initial load - reasonable for dropdown performance
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const previousAgentRef = useRef(null);

    // Helper function to get simplified workflow name
    const getSimplifiedWorkflowName = (workflowId) => {
        if (!workflowId) return '';
        
        // Split by ':' and remove first 2 parts
        const parts = workflowId.split(':');
        if (parts.length > 2) {
            return parts.slice(2).join(':').trim();
        }
        
        return workflowId;
    };

    // Helper function to get display name for a thread
    const getThreadDisplayName = (thread) => {
        if (!thread) return '';
        
        // Build display name: participantId + simplified workflowId
        let displayName = thread.participantId 
            ? thread.participantId.substring(0, 20) + (thread.participantId.length > 20 ? '...' : '')
            : 'Unknown Participant';
        
        if (thread.workflowId) {
            const simplifiedWorkflow = getSimplifiedWorkflowName(thread.workflowId);
            displayName += ` | ${simplifiedWorkflow}`;
        }
        
        return displayName;
    };

    useEffect(() => {
        // Check if agent has actually changed
        const agentChanged = previousAgentRef.current !== selectedAgentName;
        previousAgentRef.current = selectedAgentName;

        // Don't fetch if no agent is selected
        if (!selectedAgentName) {
            setThreads([]);
            setError(null);
            setIsLoading(false);
            setHasMore(false);
            setPage(1);
            return;
        }

        // Fetch when agent changes or when refreshCounter changes
        const fetchConversationThreads = async () => {
            setIsLoading(true);
            setLoading(true);
            setError(null);
            setPage(1);
            try {
                const fetchedThreads = await messagingApi.getThreads(selectedAgentName, 1, pageSize);
                setThreads(fetchedThreads || []);
                setHasMore(fetchedThreads && fetchedThreads.length === pageSize);
                
                // If there are threads but none selected, select the first one
                if (fetchedThreads && fetchedThreads.length > 0 && !selectedThreadId && agentChanged) {
                    onThreadSelect(fetchedThreads[0].id, fetchedThreads[0]);
                }
            } catch (err) {
                const errorMsg = 'Failed to fetch conversation threads.';
                setError(errorMsg);
                await handleApiError(err, errorMsg, showError);
                console.error(err);
                setThreads([]);
                setHasMore(false);
            } finally {
                setIsLoading(false);
                setLoading(false);
            }
        };

        fetchConversationThreads();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAgentName, refreshCounter]);

    // Function to load more threads
    const handleLoadMore = async () => {
        if (!selectedAgentName || loadingMore || !hasMore) return;
        
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const moreThreads = await messagingApi.getThreads(selectedAgentName, nextPage, pageSize);
            
            if (moreThreads && moreThreads.length > 0) {
                // Filter out duplicates
                const existingIds = new Set(threads.map(t => t.id));
                const uniqueNewThreads = moreThreads.filter(t => !existingIds.has(t.id));
                
                if (uniqueNewThreads.length > 0) {
                    setThreads(prevThreads => [...prevThreads, ...uniqueNewThreads]);
                    setPage(nextPage);
                    setHasMore(moreThreads.length === pageSize);
                } else {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (err) {
            await handleApiError(err, 'Failed to load more conversations', showError);
        } finally {
            setLoadingMore(false);
        }
    };

    // Get the currently selected thread object
    const selectedThread = threads.find(t => t.id === selectedThreadId) || null;

    const handleThreadChange = (newValue) => {
        if (newValue) {
            onThreadSelect(newValue.id, newValue);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
            <Autocomplete
                id="conversation-select"
                options={threads}
                value={selectedThread}
                onChange={(event, newValue) => handleThreadChange(newValue)}
                getOptionLabel={(option) => getThreadDisplayName(option)}
                filterOptions={(options, state) => {
                    // Built-in filtering by participant ID, workflow ID, and title
                    const inputValue = state.inputValue.toLowerCase();
                    if (!inputValue) return options;
                    
                    return options.filter(option => {
                        const participantMatch = option.participantId?.toLowerCase().includes(inputValue);
                        const workflowMatch = option.workflowId?.toLowerCase().includes(inputValue);
                        const titleMatch = option.title?.toLowerCase().includes(inputValue);
                        const simplifiedWorkflow = getSimplifiedWorkflowName(option.workflowId)?.toLowerCase().includes(inputValue);
                        
                        return participantMatch || workflowMatch || titleMatch || simplifiedWorkflow;
                    });
                }}
                renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                        <li key={key} {...otherProps}>
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                width: '100%',
                                py: 0.5,
                                gap: 0.5
                            }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                    <Typography variant="body2" fontWeight="medium" sx={{ wordBreak: 'break-word' }}>
                                        Participant: {option.participantId || 'Unknown'}
                                    </Typography>
                                    {option.workflowId && (
                                        <Typography 
                                            variant="caption" 
                                            color="text.secondary"
                                            sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                                        >
                                            Workflow: {getSimplifiedWorkflowName(option.workflowId)}
                                        </Typography>
                                    )}
                                </Box>
                                {option.title && (
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ wordBreak: 'break-word' }}
                                    >
                                        {option.title}
                                    </Typography>
                                )}
                                {option.updatedAt && (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                        {format(new Date(option.updatedAt), 'MMM d, h:mm a')}
                                    </Typography>
                                )}
                            </Box>
                        </li>
                    );
                }}
                ListboxProps={{
                    style: { maxHeight: '500px' },
                    // Add custom footer with load more button
                    onScroll: (event) => {
                        const listboxNode = event.currentTarget;
                        const position = listboxNode.scrollTop + listboxNode.clientHeight;
                        // Load more when scrolled near bottom
                        if (position >= listboxNode.scrollHeight - 10 && hasMore && !loadingMore) {
                            handleLoadMore();
                        }
                    }
                }}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label="Conversation" 
                        variant="outlined"
                        size="small"
                        placeholder="Search by participant, workflow, or title..."
                        helperText={
                            threads.length > 0 
                                ? `Showing ${threads.length} conversation${threads.length !== 1 ? 's' : ''}${hasMore ? '. Scroll to load more.' : ''}`
                                : null
                        }
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {(isLoading || loadingMore) && <CircularProgress size={20} />}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                disabled={isLoading || !selectedAgentName}
                fullWidth
                noOptionsText={
                    isLoading ? "Loading conversations..." : 
                    threads.length === 0 ? "No conversations found" : 
                    "No matching conversations"
                }
            />
            <Tooltip title="Start new conversation">
                <span>
                    <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={onNewConversation}
                        disabled={!selectedAgentName}
                        sx={{ flexShrink: 0, mt: 0.5 }}
                    >
                        <AddIcon />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
};

export default ConversationSelector;

