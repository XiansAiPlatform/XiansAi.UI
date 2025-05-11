import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';

// Agent icon component for reuse
const AgentIcon = ({ agent, size = 'medium' }) => {
  // Size presets
  const sizes = {
    small: { container: 34, icon: 24 },
    medium: { container: 42, icon: 32 },
    large: { container: 80, icon: 60 }
  };
  
  const { container, icon } = sizes[size] || sizes.medium;
  
  // Default colors if not specified
  const avatarColor = agent?.avatarColor || '#E0F2FE';
  const iconColor = agent?.iconColor || '#7DD3FC';
  
  return (
    <Box
      sx={{
        width: container,
        height: container,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: avatarColor,
        border: `1px solid ${iconColor}`,
      }}
    >
      <Box
        component="img"
        src="/images/agent.svg"
        alt="Agent icon"
        sx={{
          width: icon,
          height: icon,
          filter: `opacity(0.9) drop-shadow(0 0 0.5px ${iconColor})`,
        }}
      />
    </Box>
  );
};

// Message component to display individual messages
const Message = ({ message, isUser, agent }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: isUser ? 'row-reverse' : 'row',
      mb: 2
    }}
  >
    {!isUser && (
      <Box sx={{ mr: 1.5 }}>
        <AgentIcon agent={agent} size="small" />
      </Box>
    )}
    
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        maxWidth: '80%',
        borderRadius: 2,
        backgroundColor: isUser 
          ? 'primary.light' 
          : agent && agent.avatarColor 
            ? `${agent.avatarColor}33` // 20% opacity
            : 'background.paper',
        ml: isUser ? 1 : 0,
        mr: isUser ? 0 : 1,
        color: isUser ? 'white' : 'text.primary',
      }}
    >
      <Typography variant="body1">{message.text}</Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Paper>
  </Box>
);

// Typing indicator to show when the AI is "thinking"
const TypingIndicator = ({ agent }) => (
  <Box sx={{ display: 'flex', p: 2 }}>
    <Box sx={{ mr: 1.5 }}>
      <AgentIcon agent={agent} size="small" />
    </Box>
    <Paper elevation={1} sx={{ 
      p: 2, 
      borderRadius: 2,
      backgroundColor: agent?.avatarColor ? `${agent.avatarColor}33` : 'background.paper'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} thickness={5} />
        <Typography variant="body2" sx={{ ml: 1 }}>Thinking...</Typography>
      </Box>
    </Paper>
  </Box>
);

const AgentChat = ({ selectedAgent, initialPrompt = '' }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const isInitialPromptSent = useRef(false);
  
  // Focus the input field
  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current && inputRef.current.focus) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);
  
  // Handle message sending
  const handleSendMessage = useCallback((messageText) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: messageText,
      timestamp: new Date(),
      fromUser: true
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: `This is a response to "${messageText}"`,
        timestamp: new Date(),
        fromUser: false
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      setIsTyping(false);
      
      // Focus the input after AI response
      focusInput();
    }, 1500);
  }, [focusInput]);
  
  // Handle initial prompt if provided
  useEffect(() => {
    if (selectedAgent && initialPrompt && !isInitialPromptSent.current) {
      handleSendMessage(initialPrompt);
      isInitialPromptSent.current = true;
    }
  }, [selectedAgent, initialPrompt, handleSendMessage]);
  
  // Reset the initial prompt flag when agent changes
  useEffect(() => {
    isInitialPromptSent.current = false;
  }, [selectedAgent]);
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle scrolling and show/hide scroll down button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollDown(!isNearBottom);
  };
  
  // Scroll to bottom when clicking the scroll down button
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        maxHeight: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {selectedAgent ? (
        <>
          {/* Chat header */}
          <ChatHeader agent={selectedAgent} />
          
          {/* Messages area */}
          <Box 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              overflowX: 'hidden',
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
              }
            }}
          >
            {/* Welcome message */}
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', mt: 4, p: 2 }}>
                <Box sx={{ mx: 'auto', mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <AgentIcon agent={selectedAgent} size="large" />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  {selectedAgent.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                  I'm your AI assistant. How can I help you today?
                </Typography>
              </Box>
            )}
            
            {/* Messages */}
            {messages.map(msg => (
              <Message 
                key={msg.id} 
                message={msg} 
                isUser={msg.fromUser} 
                agent={selectedAgent}
              />
            ))}
            
            {/* Typing indicator */}
            {isTyping && <TypingIndicator agent={selectedAgent} />}
            
            {/* Reference for scrolling to bottom */}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Scroll to bottom button */}
          {showScrollDown && (
            <IconButton 
              size="small"
              onClick={scrollToBottom}
              sx={{ 
                position: 'absolute', 
                bottom: 80, 
                right: 16, 
                boxShadow: 2, 
                bgcolor: 'background.paper',
                zIndex: 10,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <KeyboardArrowDownIcon />
            </IconButton>
          )}
          
          {/* Message input */}
          <MessageInput 
            onSendMessage={handleSendMessage} 
            isTyping={isTyping} 
            inputRef={inputRef}
          />
        </>
      ) : (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            p: 3
          }}
        >
          <Typography variant="h5" gutterBottom>
            Select an AI Agent
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Choose an agent from the sidebar to start a conversation.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AgentChat; 