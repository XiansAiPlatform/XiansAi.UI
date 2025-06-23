import { Box } from '@mui/material';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import WelcomeMessage from './WelcomeMessage';

const MessageArea = ({ 
  scrollContainerRef, 
  handleScroll, 
  theme, 
  messages, 
  selectedAgent, 
  isTyping, 
  messagesEndRef 
}) => (
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
    {messages.length === 0 && <WelcomeMessage agent={selectedAgent} />}
    
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
);

export default MessageArea; 