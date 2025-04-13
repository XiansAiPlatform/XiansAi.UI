import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    useTheme,
    IconButton,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Divider
} from '@mui/material';
import { format } from 'date-fns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { formatStatus } from './utils/ConversationUtils';

/**
 * Displays a single message with expandable details
 * 
 * @param {Object} props
 * @param {Object} props.message - The message object to display
 * @param {string} props.message.id - Message ID
 * @param {string} props.message.threadId - Thread ID
 * @param {string} props.message.tenantId - Tenant ID
 * @param {string} props.message.direction - 'Incoming' or 'Outgoing'
 * @param {string} props.message.status - Message status
 * @param {string} props.message.createdAt - Creation timestamp
 * @param {string} props.message.createdBy - User who created the message
 * @param {string} props.message.content - Message content
 * @param {string} props.message.participantChannelId - Channel ID
 * @param {Object} [props.message.metadata] - Optional message metadata
 * @param {Array} [props.message.logs] - Optional message logs
 */
const MessageItem = ({ message }) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);
    const isIncoming = message.direction === 'Incoming';
    const formattedDate = message.createdAt ? format(new Date(message.createdAt), 'MMM d, yyyy h:mm a') : '';
    const messageContent = message.content?.replace(/^"|"$/g, '') || '';
    
    const handleExpandClick = (e) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };
    
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: isIncoming ? 'flex-start' : 'flex-end',
                mb: expanded ? 2 : 1,
                width: '100%'
            }}
        >
            <Paper 
                elevation={0} 
                sx={{
                    p: 1.5,
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
                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        {message.participantChannelId}
                    </Typography>
                    <Box display="flex" alignItems="center">
                        <Chip 
                            label={message.direction} 
                            size="small" 
                            color={message.direction === 'Incoming' ? 'info' : 'primary'} 
                            sx={{ 
                                height: 18,
                                '& .MuiChip-label': { 
                                    px: 1,
                                    fontSize: '0.65rem'
                                }
                            }} 
                        />
                        <Chip 
                            label={formatStatus(message.status)} 
                            size="small" 
                            color="default"
                            sx={{ 
                                ml: 1, 
                                height: 18,
                                '& .MuiChip-label': { 
                                    px: 1,
                                    fontSize: '0.65rem'
                                }
                            }} 
                        />
                        <IconButton 
                            size="small" 
                            onClick={handleExpandClick}
                            sx={{ 
                                ml: 0.5, 
                                color: theme.palette.grey[600],
                                p: 0.3,
                                width: 20,
                                height: 20
                            }}
                        >
                            {expanded ? <ExpandLessIcon fontSize="inherit" /> : <ExpandMoreIcon fontSize="inherit" />}
                        </IconButton>
                    </Box>
                </Box>
                
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{messageContent}</Typography>
                
                <Typography 
                    variant="caption" 
                    sx={{ 
                        display: 'block', 
                        textAlign: 'right', 
                        mt: 0.5,
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
                                py: 0.3,
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

export default MessageItem; 