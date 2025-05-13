import React from 'react';
import { useTheme } from '@mui/material/styles';
import ChatContainer from './ChatContainer';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import MessageArea from './MessageArea';
import EmptyState from './EmptyState';
import ScrollDownButton from './ScrollDownButton';
import useInputFocus from './hooks/useInputFocus';
import useChatMessages from './hooks/useChatMessages';
import useScrollHandling from './hooks/useScrollHandling';

const AgentChat = ({ selectedAgent, initialPrompt = '' }) => {
  const theme = useTheme();
  
  // Custom hooks
  const { inputRef, focusInput } = useInputFocus();
  const { messages, isTyping, handleSendMessage } = useChatMessages(initialPrompt, selectedAgent, focusInput);
  const { 
    showScrollDown, 
    messagesEndRef, 
    scrollContainerRef, 
    handleScroll, 
    scrollToBottom 
  } = useScrollHandling(messages);
  
  return (
    <ChatContainer>
      {selectedAgent ? (
        <>
          {/* Chat header */}
          <ChatHeader agent={selectedAgent} />
          
          {/* Messages area */}
          <MessageArea 
            scrollContainerRef={scrollContainerRef}
            handleScroll={handleScroll}
            theme={theme}
            messages={messages}
            selectedAgent={selectedAgent}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
          />
          
          {/* Scroll to bottom button */}
          {showScrollDown && <ScrollDownButton onClick={scrollToBottom} />}
          
          {/* Message input */}
          <MessageInput 
            onSendMessage={handleSendMessage} 
            isTyping={isTyping} 
            inputRef={inputRef}
          />
        </>
      ) : (
        <EmptyState />
      )}
    </ChatContainer>
  );
};

export default AgentChat; 