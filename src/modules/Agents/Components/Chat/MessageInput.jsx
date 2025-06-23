import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  InputAdornment,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const MessageInput = ({ onSendMessage, isTyping = false, inputRef }) => {
  const [message, setMessage] = useState('');
  const localInputRef = useRef(null);
  
  // Use the inputRef from props or the local one
  const actualInputRef = inputRef || localInputRef;
  
  // Focus the input field on first render
  useEffect(() => {
    if (actualInputRef.current) {
      actualInputRef.current.focus();
    }
  }, [actualInputRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;
    
    onSendMessage(message);
    setMessage('');
    
    // Re-focus the input field after sending
    setTimeout(() => {
      if (actualInputRef.current) {
        actualInputRef.current.focus();
      }
    }, 0);
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      <TextField
        fullWidth
        placeholder="Type a message..."
        variant="outlined"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isTyping}
        autoComplete="off"
        inputRef={actualInputRef}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Attach file">
                <IconButton 
                  size="small" 
                  sx={{ mr: 0.5 }}
                  disabled={isTyping}
                  tabIndex={-1}
                  aria-label="Attach file"
                >
                  <AttachFileIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Voice input">
                <IconButton 
                  size="small" 
                  sx={{ mr: 0.5 }}
                  disabled={isTyping}
                  tabIndex={-1}
                  aria-label="Voice input"
                >
                  <MicIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Send message">
                <IconButton 
                  type="submit"
                  disabled={!message.trim() || isTyping}
                  color="primary"
                  aria-label="Send message"
                >
                  <SendIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          sx: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }
        }}
        sx={{
          width: '100%',
        }}
      />
    </Box>
  );
};

export default MessageInput; 