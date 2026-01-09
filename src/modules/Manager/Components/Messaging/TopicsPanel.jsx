import { useState, useEffect, useCallback } from 'react';
import { 
    Paper, 
    Box, 
    Typography, 
    useTheme,
    List,
    ListItemButton,
    ListItemText,
    Chip,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import TopicIcon from '@mui/icons-material/Topic';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { handleApiError } from '../../utils/errorHandler';

/**
 * Topics panel component - displays topics (scopes) for the selected conversation
 * @param {Object} props
 * @param {string} props.selectedAgentName - Selected agent name
 * @param {string} props.selectedThreadId - Selected thread ID
 * @param {Object} props.messagingApi - Messaging API service
 * @param {Function} props.showError - Function to display errors
 * @param {Function} props.onTopicSelect - Callback when topic is selected
 * @param {string|null} props.selectedTopic - Currently selected topic (scope)
 * @param {number} props.refreshCounter - Counter to trigger refresh
 */
const TopicsPanel = ({ 
    selectedAgentName, 
    selectedThreadId, 
    messagingApi, 
    showError,
    onTopicSelect,
    selectedTopic,
    refreshCounter = 0
}) => {
    const theme = useTheme();
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalTopics, setTotalTopics] = useState(0);
    
    const pageSize = 50; // Default page size

    // Fetch topics for the selected thread (first page)
    const fetchTopics = useCallback(async (resetPage = true) => {
        if (!selectedThreadId || !messagingApi) {
            setTopics([]);
            setCurrentPage(1);
            setHasMore(false);
            setTotalTopics(0);
            return;
        }

        setIsLoading(true);
        setError(null);
        if (resetPage) {
            setCurrentPage(1);
        }

        try {
            const response = await messagingApi.getThreadTopics(selectedThreadId, 1, pageSize);
            
            // Handle both old format (array) and new format (object with topics and pagination)
            const topicsData = response.topics || response || [];
            const paginationData = response.pagination;
            
            setTopics(topicsData);
            
            if (paginationData) {
                setHasMore(paginationData.hasMore || false);
                setTotalTopics(paginationData.totalTopics || 0);
                setCurrentPage(paginationData.currentPage || 1);
            } else {
                // Old format without pagination
                setHasMore(false);
                setTotalTopics(topicsData.length);
            }
            
            // If no topic is selected and topics exist, select the most recent one (first in list)
            if (selectedTopic === undefined && topicsData && topicsData.length > 0) {
                // Select the first (most recent) topic by default
                // Topics are sorted by lastMessageAt DESC from the API, so first is most recent
                onTopicSelect?.(topicsData[0].scope);
            }
        } catch (err) {
            const errorMsg = 'Failed to fetch topics';
            setError(errorMsg);
            await handleApiError(err, errorMsg, showError);
            setTopics([]);
            setHasMore(false);
            setTotalTopics(0);
        } finally {
            setIsLoading(false);
        }
    }, [selectedThreadId, messagingApi, showError, onTopicSelect, selectedTopic, pageSize]);
    
    // Load more topics (next page)
    const loadMoreTopics = useCallback(async () => {
        if (!selectedThreadId || !messagingApi || !hasMore || isLoadingMore) {
            return;
        }

        setIsLoadingMore(true);
        setError(null);

        try {
            const nextPage = currentPage + 1;
            const response = await messagingApi.getThreadTopics(selectedThreadId, nextPage, pageSize);
            
            // Handle both old format (array) and new format (object with topics and pagination)
            const topicsData = response.topics || response || [];
            const paginationData = response.pagination;
            
            // Append new topics to existing ones
            setTopics(prevTopics => [...prevTopics, ...topicsData]);
            
            if (paginationData) {
                setHasMore(paginationData.hasMore || false);
                setTotalTopics(paginationData.totalTopics || 0);
                setCurrentPage(paginationData.currentPage || nextPage);
            } else {
                // Old format without pagination
                setHasMore(false);
            }
        } catch (err) {
            const errorMsg = 'Failed to load more topics';
            setError(errorMsg);
            await handleApiError(err, errorMsg, showError);
        } finally {
            setIsLoadingMore(false);
        }
    }, [selectedThreadId, messagingApi, showError, hasMore, isLoadingMore, currentPage, pageSize]);

    // Fetch topics when thread changes or refresh is triggered
    useEffect(() => {
        fetchTopics();
    }, [selectedThreadId, refreshCounter, fetchTopics]);

    // Reset topics when agent changes
    useEffect(() => {
        if (!selectedAgentName) {
            setTopics([]);
            setError(null);
        }
    }, [selectedAgentName]);

    // Calculate total message count across all topics
    const totalMessageCount = topics.reduce((sum, topic) => sum + (topic.messageCount || 0), 0);

    // Render loading state
    if (isLoading && topics.length === 0) {
        return (
            <Paper 
                sx={{
                    bgcolor: theme.palette.background.paper,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}
            >
                <Box sx={{ 
                    p: 2, 
                    borderBottom: '1px solid', 
                    borderColor: theme.palette.divider,
                }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Topics
                    </Typography>
                </Box>
                <Box sx={{ 
                    flex: '1 1 auto', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    p: 3
                }}>
                    <CircularProgress size={24} />
                </Box>
            </Paper>
        );
    }

    return (
        <Paper 
            sx={{
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            {/* Header */}
            <Box sx={{ 
                p: 1.5, 
                borderBottom: '1px solid', 
                borderColor: theme.palette.divider,
                backgroundColor: theme.palette.background.paper,
            }}>
                <Typography variant="subtitle2" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
                    Topics {totalTopics > 0 && <Typography component="span" variant="caption" color="text.secondary">({totalTopics})</Typography>}
                </Typography>
            </Box>

            {/* Topics List */}
            <Box sx={{ 
                flex: '1 1 auto', 
                overflowY: 'auto'
            }}>
                {error && (
                    <Box sx={{ p: 2 }}>
                        <Alert severity="error" sx={{ borderRadius: 'var(--radius-md)' }}>
                            {error}
                        </Alert>
                    </Box>
                )}

                {!selectedThreadId ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        p: 3,
                        minHeight: '200px'
                    }}>
                        <Typography variant="body2" color="text.secondary" align="center">
                            Select a conversation to view topics
                        </Typography>
                    </Box>
                ) : topics.length === 0 && !isLoading ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        p: 3,
                        minHeight: '200px'
                    }}>
                        <Typography variant="body2" color="text.secondary" align="center">
                            No topics found
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <List sx={{ p: 0.75 }}>
                            {/* "All Messages" option */}
                            <ListItemButton
                                selected={selectedTopic === undefined}
                                onClick={() => onTopicSelect?.(undefined)}
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.25,
                                    alignItems: 'center',
                                    py: 1,
                                    px: 1.5,
                                    minHeight: 'auto',
                                    '&.Mui-selected': {
                                        bgcolor: theme.palette.action.selected,
                                        '&:hover': {
                                            bgcolor: theme.palette.action.selected,
                                        }
                                    }
                                }}
                            >
                                <AllInboxIcon sx={{ 
                                    mr: 1.25, 
                                    color: theme.palette.text.secondary, 
                                    fontSize: 18,
                                    flexShrink: 0
                                }} />
                                <ListItemText 
                                    primary="All Messages"
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        fontSize: '0.875rem',
                                        fontWeight: selectedTopic === undefined ? 600 : 400
                                    }}
                                />
                                {totalMessageCount > 0 && (
                                    <Chip 
                                        label={totalMessageCount} 
                                        size="small" 
                                        sx={{ 
                                            height: 18,
                                            minWidth: 18,
                                            fontSize: '0.65rem',
                                            flexShrink: 0
                                        }}
                                    />
                                )}
                            </ListItemButton>

                            {/* Individual topics */}
                            {topics.map((topic) => {
                                // Distinguish between null, empty string, and actual values
                                let topicLabel;
                                let hasSpecialScope = false;
                                
                                if (topic.scope === null) {
                                    topicLabel = 'No Topic';
                                    hasSpecialScope = true;
                                } else if (topic.scope === '') {
                                    topicLabel = 'Empty Topic';
                                    hasSpecialScope = true;
                                } else {
                                    topicLabel = topic.scope;
                                }
                                
                                const isSelected = selectedTopic === topic.scope;
                                
                                return (
                                    <ListItemButton
                                        key={topic.scope === null || topic.scope === '' ? `empty-${Math.random()}` : topic.scope}
                                        selected={isSelected}
                                        onClick={() => onTopicSelect?.(topic.scope)}
                                        sx={{
                                            borderRadius: 1,
                                            mb: 0.25,
                                            alignItems: 'center',
                                            py: 1,
                                            px: 1.5,
                                            minHeight: 'auto',
                                            '&.Mui-selected': {
                                                bgcolor: theme.palette.action.selected,
                                                '&:hover': {
                                                    bgcolor: theme.palette.action.selected,
                                                }
                                            }
                                        }}
                                    >
                                        <TopicIcon sx={{ 
                                            mr: 1.25, 
                                            color: hasSpecialScope ? theme.palette.text.disabled : theme.palette.primary.main, 
                                            fontSize: 18,
                                            flexShrink: 0
                                        }} />
                                        <ListItemText 
                                            primary={topicLabel}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                fontSize: '0.875rem',
                                                fontWeight: isSelected ? 600 : 400,
                                                fontStyle: hasSpecialScope ? 'italic' : 'normal',
                                                color: hasSpecialScope ? 'text.secondary' : 'text.primary',
                                                sx: {
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    lineHeight: 1.3
                                                }
                                            }}
                                        />
                                        {topic.messageCount > 0 && (
                                            <Chip 
                                                label={topic.messageCount} 
                                                size="small" 
                                                color={isSelected ? 'primary' : 'default'}
                                                sx={{ 
                                                    height: 18,
                                                    minWidth: 18,
                                                    fontSize: '0.65rem',
                                                    flexShrink: 0
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                );
                            })}
                        </List>
                        
                        {/* Load More Button */}
                        {hasMore && !isLoading && (
                            <Box sx={{ p: 1, textAlign: 'center', borderTop: '1px solid', borderColor: theme.palette.divider }}>
                                <Button
                                    onClick={loadMoreTopics}
                                    disabled={isLoadingMore}
                                    size="small"
                                    endIcon={isLoadingMore ? <CircularProgress size={14} /> : <ExpandMoreIcon fontSize="small" />}
                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                >
                                    {isLoadingMore ? 'Loading...' : `Load More (${totalTopics - topics.length})`}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Paper>
    );
};

export default TopicsPanel;

