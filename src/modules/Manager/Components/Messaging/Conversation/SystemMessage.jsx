import { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    useTheme,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Divider
} from '@mui/material';
import { format } from 'date-fns';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatStatus } from '../utils/ConversationUtils';

/**
 * Component for displaying system messages with empty content
 * 
 * @param {Object} props
 * @param {Object} props.message - The system message object
 */
const SystemMessage = ({ message }) => {
    const theme = useTheme();
    const [systemExpanded, setSystemExpanded] = useState(false);
    const formattedDate = message.createdAt ? format(new Date(message.createdAt), 'MMM d, yyyy h:mm a') : '';

    // Check if message is incoming (from user) or outgoing (from agent)
    const isIncoming = message.direction === 'Incoming';

    // Determine the system message text based on direction
    const getSystemMessageText = () => {
        if (isIncoming) {
            return 'System message from user';
        } else {
            return 'System message from agent';
        }
    };

    const handleSystemExpandClick = (e) => {
        e.stopPropagation();
        setSystemExpanded(!systemExpanded);
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: isIncoming ? 'flex-start' : 'flex-end',
                justifyContent: 'center',
                width: '100%',
                my: 2,
                px: 2
            }}
        >
            {/* Simple collapsed view - similar to handover message */}
            {!systemExpanded ? (
                <Box
                    onClick={handleSystemExpandClick}
                    sx={{
                        textAlign: isIncoming ? 'left' : 'right',
                        cursor: 'pointer',
                        borderRadius: 1,
                        padding: '6px 12px',
                        maxWidth: '80%',
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover
                        }
                    }}
                >
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            fontStyle: 'italic',
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                            fontSize: '0.8rem',
                        }}
                    >
                        {getSystemMessageText()} • {formattedDate}
                    </Typography>
                    {message.text && (
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: theme.palette.text.primary,
                                mt: 0.5,
                                fontSize: '0.85rem',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}
                        >
                            {message.text}
                        </Typography>
                    )}
                </Box>
            ) : (
                /* Detailed expanded view */
                (<Paper 
                    elevation={0}
                    sx={{
                        width: '80%',
                        maxWidth: '600px',
                        backgroundColor: theme.palette.warning.light + '15',
                        border: '1px solid',
                        borderColor: theme.palette.warning.main + '40',
                        borderRadius: 2,
                        p: 2
                    }}
                >
                    <Box 
                        onClick={handleSystemExpandClick}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 2,
                            cursor: 'pointer',
                            borderRadius: 1,
                            p: 1,
                            mx: -1,
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover
                            }
                        }}
                    >
                        <InfoOutlinedIcon 
                            sx={{ 
                                color: theme.palette.warning.main,
                                fontSize: '1.2rem',
                                mr: 1
                            }} 
                        />
                        <Typography 
                            variant="subtitle2" 
                            sx={{ 
                                fontWeight: 600,
                                color: theme.palette.warning.dark,
                                flexGrow: 1
                            }}
                        >
                            {getSystemMessageText()}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: theme.palette.text.secondary,
                                mr: 1
                            }}
                        >
                            {formattedDate}
                        </Typography>
                        <IconButton 
                            size="small" 
                            onClick={handleSystemExpandClick}
                            sx={{ 
                                color: theme.palette.warning.main,
                                p: 0.5,
                                width: 24,
                                height: 24
                            }}
                        >
                            <ExpandLessIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Divider sx={{ my: 2, borderColor: theme.palette.warning.main + '30' }} />
                    
                    {/* Display message text if available */}
                    {message.text && (
                        <>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    fontWeight: 600,
                                    mb: 1,
                                    color: theme.palette.warning.dark
                                }}
                            >
                                Message Text
                            </Typography>
                            <Box
                                sx={{
                                    backgroundColor: theme.palette.background.paper,
                                    p: 1.5,
                                    borderRadius: 1,
                                    mb: 2,
                                    border: '1px solid',
                                    borderColor: theme.palette.grey[200]
                                }}
                            >
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: theme.palette.text.primary,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {message.text}
                                </Typography>
                            </Box>
                        </>
                    )}
                    
                    <Typography 
                        variant="subtitle2" 
                        sx={{ 
                            fontWeight: 600,
                            mb: 2,
                            color: theme.palette.warning.dark
                        }}
                    >
                        Message Metadata
                    </Typography>
                    {message.data ? (
                        <Box sx={{ mt: 1 }}>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    display: 'block', 
                                    fontWeight: 'bold',
                                    mb: 1
                                }}
                            >
                                Message Data
                            </Typography>
                            <Box 
                                component="pre" 
                                sx={{ 
                                    fontFamily: 'monospace', 
                                    fontSize: '0.7rem',
                                    backgroundColor: theme.palette.grey[50],
                                    p: 1,
                                    borderRadius: 1,
                                    maxHeight: 300,
                                    overflow: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    border: '1px solid',
                                    borderColor: theme.palette.grey[200]
                                }}
                            >
                                {JSON.stringify(message.data, null, 2)}
                            </Box>
                        </Box>
                    ) : (
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: theme.palette.text.secondary,
                                fontStyle: 'italic'
                            }}
                        >
                            No metadata available
                        </Typography>
                    )}
                    <Typography 
                        variant="subtitle2" 
                        sx={{ 
                            fontWeight: 600,
                            mb: 1,
                            color: theme.palette.warning.dark
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
                                borderColor: theme.palette.grey[200],
                                py: 0.3,
                                px: 1,
                                fontSize: '0.75rem'
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
                                        Request ID
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: theme.palette.text.primary,
                                        wordBreak: 'break-all'
                                    }}>
                                        {message.requestId || 'N/A'}
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
                                        {message.createdBy || 'System'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Message Type
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>
                                        {message.messageType || 'N/A'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Scope
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>
                                        {message.scope || 'N/A'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Hint
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: theme.palette.text.primary,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}>
                                        {message.hint || 'N/A'}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>)
            )}
        </Box>
    );
};

export default SystemMessage; 