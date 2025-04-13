import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    List,
    ListItemText,
    ListItemButton,
    Divider,
    Chip,
    Badge,
    useTheme,
    Button,
    IconButton,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from '@mui/material';
import { format } from 'date-fns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Utility function for relative time
const getRelativeTimeString = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSecs < 60) {
        return 'just now';
    } else if (diffInMins < 60) {
        return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays === 1) {
        return 'yesterday';
    } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    } else {
        // For older dates, show the actual date
        return date.toLocaleDateString();
    }
};

export const MessageItem = ({ message }) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);
    const isIncoming = message.direction === 'Incoming';
    const formattedDate = message.createdAt ? format(new Date(message.createdAt), 'MMM d, yyyy h:mm a') : '';
    const messageContent = message.content?.replace(/^"|"$/g, '') || '';
    
    // Format status for display
    const formatStatus = (status) => {
        if (!status) return 'Unknown';
        
        // Add spaces before capital letters and capitalize first letter
        return status
            .replace(/([A-Z])/g, ' $1')
            .replace(/^\s/, '')
            .replace(/^./, str => str.toUpperCase());
    };
    
    const handleExpandClick = (e) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };
    
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: isIncoming ? 'flex-start' : 'flex-end',
                mb: expanded ? 3 : 2,
                width: '100%'
            }}
        >
            <Paper 
                elevation={0} 
                sx={{
                    p: 2,
                    width: '70%',
                    backgroundColor: isIncoming ? theme.palette.grey[50] : theme.palette.grey[100],
                    color: isIncoming ? theme.palette.text.primary : theme.palette.text.primary,
                    borderRadius: theme.shape.borderRadius,
                    position: 'relative',
                    border: '1px solid',
                    borderColor: isIncoming ? theme.palette.grey[200] : theme.palette.grey[300],
                    borderLeftWidth: '4px',
                    borderLeftColor: isIncoming ? theme.palette.info.light : theme.palette.primary.light,
                }}
            >
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="medium">
                        {message.participantChannelId}
                    </Typography>
                    <Box display="flex" alignItems="center">
                        <Chip 
                            label={message.direction} 
                            size="small" 
                            color={message.direction === 'Incoming' ? 'info' : 'primary'} 
                            sx={{ 
                                height: 20,
                                '& .MuiChip-label': { 
                                    px: 1,
                                    fontSize: '0.7rem'
                                }
                            }} 
                        />
                        <Chip 
                            label={formatStatus(message.status)} 
                            size="small" 
                            color="default"
                            sx={{ 
                                ml: 1, 
                                height: 20,
                                '& .MuiChip-label': { 
                                    px: 1,
                                    fontSize: '0.7rem'
                                }
                            }} 
                        />
                        <IconButton 
                            size="small" 
                            onClick={handleExpandClick}
                            sx={{ 
                                ml: 0.5, 
                                color: theme.palette.grey[600],
                                p: 0.5
                            }}
                        >
                            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                    </Box>
                </Box>
                
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{messageContent}</Typography>
                
                <Typography 
                    variant="caption" 
                    sx={{ 
                        display: 'block', 
                        textAlign: 'right', 
                        mt: 1,
                        color: 'text.secondary'
                    }}
                >
                    {formattedDate}
                </Typography>
                
                <Collapse in={expanded} timeout="auto" unmountOnExit sx={{ mt: 2 }}>
                    <Divider sx={{ my: 1, borderColor: theme.palette.grey[300] }} />
                    
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            display: 'block', 
                            fontWeight: 'bold',
                            mb: 1,
                            color: theme.palette.text.secondary
                        }}
                    >
                        Message Details
                    </Typography>
                    
                    <TableContainer component={Box} sx={{ 
                        backgroundColor: 'transparent',
                        fontSize: '0.75rem'
                    }}>
                        <Table size="small" sx={{ 
                            '& .MuiTableCell-root': { 
                                borderColor: theme.palette.grey[300],
                                py: 0.5,
                                px: 1
                            }
                        }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold', 
                                        width: '30%',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Message ID
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: theme.palette.text.primary,
                                        wordBreak: 'break-all'
                                    }}>
                                        {message.id}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Thread ID
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: theme.palette.text.primary,
                                        wordBreak: 'break-all'
                                    }}>
                                        {message.threadId}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Tenant ID
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>
                                        {message.tenantId}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Direction
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>
                                        {message.direction}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Status
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>
                                        {formatStatus(message.status)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Created By
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>
                                        {message.createdBy}
                                    </TableCell>
                                </TableRow>
                                {message.metadata && (
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Metadata
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: theme.palette.text.primary,
                                        wordBreak: 'break-all'
                                    }}>
                                        {typeof message.metadata === 'object' 
                                            ? JSON.stringify(message.metadata) 
                                            : message.metadata}
                                    </TableCell>
                                </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    {message.logs && message.logs.length > 0 && (
                        <>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    display: 'block', 
                                    fontWeight: 'bold',
                                    mt: 2,
                                    mb: 1,
                                    color: theme.palette.text.secondary
                                }}
                            >
                                Message Logs
                            </Typography>
                            <TableContainer component={Box} sx={{ backgroundColor: 'transparent' }}>
                                <Table size="small" sx={{ 
                                    '& .MuiTableCell-root': { 
                                        borderColor: theme.palette.grey[300],
                                        py: 0.5,
                                        px: 1
                                    }
                                }}>
                                    <TableBody>
                                        {message.logs.map((log, index) => (
                                            <TableRow key={index}>
                                                <TableCell component="th" sx={{ 
                                                    fontWeight: 'bold',
                                                    width: '30%',
                                                    color: theme.palette.text.secondary
                                                }}>
                                                    {log.event}
                                                </TableCell>
                                                <TableCell sx={{ color: theme.palette.text.primary }}>
                                                    {format(new Date(log.timestamp), 'MMM d, yyyy h:mm:ss a')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Collapse>
            </Paper>
        </Box>
    );
};

export const ChatConversation = ({ 
    messages, 
    selectedThread, 
    onSendMessage, 
    onLoadMoreMessages, 
    isLoadingMore = false, 
    hasMoreMessages = true 
}) => {
    const theme = useTheme();

    // Sort messages to show most recent at top
    const sortedMessages = [...messages].sort((a, b) => {
        // If createdAt is available, sort by that
        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // Fallback to maintain current order if no timestamps
        return 0;
    });

    // When selected thread changes, scroll to top
    useEffect(() => {
        if (messages.length > 0) {
            window.scrollTo(0, 0);
        }
    }, [selectedThread?.id]);

    return (
        <Paper 
            elevation={0}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.default,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: theme.shape.borderRadius,
                overflow: 'hidden'
            }}
        >
            {/* Thread Header */}
            {selectedThread && (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 2, 
                        bgcolor: theme.palette.background.paper, 
                        borderBottom: '1px solid',
                        borderColor: theme.palette.divider,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                            {selectedThread.participantId || 'Conversation'}
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            size="small"
                            onClick={onSendMessage}
                            sx={{ 
                                fontWeight: 500,
                                textTransform: 'none',
                                px: 2
                            }}
                        >
                            Send Message
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Thread ID:</strong> {selectedThread.id}
                        </Typography>
                        {selectedThread.title && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>Topic:</strong> {selectedThread.title}
                            </Typography>
                        )}
                        {selectedThread.updatedAt && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>Last update:</strong> {getRelativeTimeString(selectedThread.updatedAt)}
                            </Typography>
                        )}
                        {selectedThread.createdAt && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>Started:</strong> {getRelativeTimeString(selectedThread.createdAt)}
                            </Typography>
                        )}
                    </Box>
                </Paper>
            )}
            
            {/* Messages Container */}
            <Box 
                sx={{ 
                    p: 2, 
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {messages.length === 0 ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        flexGrow: 1, 
                        height: '100%',
                        color: theme.palette.text.secondary
                    }}>
                        <Box sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                No messages found
                            </Typography>
                            <Typography variant="body2">
                                Start a conversation or select another thread
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <>
                        <List sx={{ px: 1, width: '100%' }}>
                            {sortedMessages.map((msg, index) => (
                                <MessageItem key={msg.id || index} message={msg} />
                            ))}
                        </List>
                        
                        {/* Load More Button at the bottom */}
                        {hasMoreMessages && (
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    py: 2,
                                    mt: 2
                                }}
                            >
                                <Button 
                                    size="small" 
                                    onClick={onLoadMoreMessages}
                                    disabled={isLoadingMore}
                                    startIcon={isLoadingMore ? <CircularProgress size={16} /> : <ExpandMoreIcon />}
                                    variant="outlined"
                                    color="primary"
                                    sx={{ textTransform: 'none' }}
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load older messages'}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Paper>
    );
};

export const ConversationThreads = ({ threads, selectedThreadId, onThreadSelect, isLoading }) => {
    const theme = useTheme();
    
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
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: theme.palette.divider }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Conversations
                </Typography>
            </Box>
            
            <Box>
                {threads.length === 0 ? (
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography color="text.secondary" align="center">
                            No conversation threads found
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {threads.map(thread => (
                            <React.Fragment key={thread.id}>
                                <ListItemButton 
                                    selected={selectedThreadId === thread.id}
                                    onClick={() => onThreadSelect(thread.id)}
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