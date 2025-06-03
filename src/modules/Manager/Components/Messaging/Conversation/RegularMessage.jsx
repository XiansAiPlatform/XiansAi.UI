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
    Divider,
    Avatar
} from '@mui/material';
import { format } from 'date-fns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { formatStatus } from '../utils/ConversationUtils';

/**
 * Component for displaying regular incoming/outgoing messages
 * 
 * @param {Object} props
 * @param {Object} props.message - The message object
 * @param {boolean} [props.isRecent] - Whether the message is recent (less than 1 minute old)
 */
const RegularMessage = ({ message, isRecent = false }) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);
    const isIncoming = message.direction === 'Incoming';
    const formattedDate = message.createdAt ? format(new Date(message.createdAt), 'MMM d, yyyy h:mm a') : '';
    const messageContent = message.content?.replace(/^"|"$/g, '') || '';
    const senderName = isIncoming ? (message.participantId || 'Unknown') : (message.workflowType || 'System');

    const handleExpandClick = (e) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: isIncoming ? 'flex-start' : 'flex-end',
                mb: expanded ? 3 : 6,
                width: '100%',
                position: 'relative',
                pl: isIncoming ? '12px' : 0,
                pr: isIncoming ? 0 : '12px',
            }}
        >
            <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{
                    ml: isIncoming ? 1 : 0,
                    mr: isIncoming ? 0 : 1,
                    mb: 0.5
                }}
            >
                {senderName}
            </Typography>
            
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: isIncoming ? 'flex-start' : 'flex-end',
                    width: '100%',
                    alignItems: 'flex-start',
                    gap: 1
                }}
            >
                {isIncoming && (
                    <Avatar 
                        sx={{ 
                            width: 56, 
                            height: 56, 
                            bgcolor: 'transparent',
                            mt: 1,
                            overflow: 'visible',
                            border: '1px solid',
                            borderColor: theme.palette.grey[200],
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Box
                            component="img"
                            src="/images/user.svg"
                            alt="User"
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </Avatar>
                )}
                
                <Paper 
                    elevation={0} 
                    sx={{
                        p: { left: 0, right: 2.5, top: 2, bottom: 2 },
                        pl: 1.5,
                        width: '70%',
                        backgroundColor: isRecent 
                            ? (isIncoming ? theme.palette.info.light : theme.palette.primary.light) + '20' // Add 20% opacity
                            : isIncoming ? theme.palette.grey[50] : theme.palette.grey[100],
                        color: isIncoming ? theme.palette.text.primary : theme.palette.text.primary,
                        borderRadius: '5px',
                        position: 'relative',
                        border: '1px solid',
                        borderColor: isRecent 
                            ? (isIncoming ? theme.palette.info.main : theme.palette.primary.main)
                            : isIncoming ? theme.palette.grey[200] : theme.palette.grey[300],
                        transition: 'all 0.3s ease',
                        boxShadow: isRecent ? '0 0 8px rgba(0, 0, 0, 0.1)' : 'none',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            width: 0,
                            height: 0,
                            borderStyle: 'solid',
                            borderWidth: isIncoming ? '8px 8px 8px 0' : '8px 0 8px 8px',
                            borderColor: isIncoming 
                                ? `transparent ${isRecent ? theme.palette.info.main : theme.palette.grey[200]} transparent transparent` 
                                : `transparent transparent transparent ${isRecent ? theme.palette.primary.main : theme.palette.grey[300]}`,
                            top: '20px',
                            [isIncoming ? 'left' : 'right']: '-8px',
                            zIndex: 1
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            width: 0,
                            height: 0,
                            borderStyle: 'solid',
                            borderWidth: isIncoming ? '7px 7px 7px 0' : '7px 0 7px 7px',
                            borderColor: isIncoming 
                                ? `transparent ${isRecent ? theme.palette.info.light + '20' : theme.palette.grey[50]} transparent transparent` 
                                : `transparent transparent transparent ${isRecent ? theme.palette.primary.light + '20' : theme.palette.grey[100]}`,
                            top: '21px',
                            [isIncoming ? 'left' : 'right']: '-7px',
                            zIndex: 2
                        }
                    }}
                >
                    <Box sx={{ mb: 1, mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                {message.participantChannelId}
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ color: 'text.secondary' }}
                            >
                                {formattedDate}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <Chip 
                                label={message.direction} 
                                size="small" 
                                color={message.direction === 'Incoming' ? 'info' : message.direction === 'Outgoing' ? 'primary' : 'default'} 
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
                            {isRecent && (
                                <Chip 
                                    label="New" 
                                    size="small" 
                                    color="success"
                                    sx={{ 
                                        ml: 1, 
                                        height: 18,
                                        '& .MuiChip-label': { 
                                            px: 1,
                                            fontSize: '0.65rem'
                                        }
                                    }} 
                                />
                            )}
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
                    
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            whiteSpace: 'pre-wrap', 
                            lineHeight: 1.4,
                            mt: 1,
                            mb: 1,
                            pr: 1,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            wordWrap: 'break-word'
                        }}
                    >
                        {messageContent}
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
                                            FlowType
                                        </TableCell>
                                        <TableCell sx={{ color: theme.palette.text.primary }}>
                                            {message.workflowType}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" sx={{ 
                                            fontWeight: 'bold',
                                            color: theme.palette.text.secondary
                                        }}>
                                            FlowId
                                        </TableCell>
                                        <TableCell sx={{ color: theme.palette.text.primary }}>
                                            {message.workflowId}
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
                
                {!isIncoming && (
                    <Avatar 
                        sx={{ 
                            width: 56, 
                            height: 56, 
                            bgcolor: 'transparent',
                            mt: 1,
                            overflow: 'visible',
                            border: '1px solid',
                            borderColor: theme.palette.grey[200],
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Box
                            component="img"
                            src="/images/agent.svg"
                            alt="Agent"
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </Avatar>
                )}
            </Box>
        </Box>
    );
};

export default RegularMessage; 