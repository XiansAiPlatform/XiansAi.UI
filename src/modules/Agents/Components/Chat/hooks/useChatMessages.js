import { useState, useRef, useCallback, useEffect } from 'react';

const useChatMessages = (initialPrompt = '', selectedAgent, focusInput) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const isInitialPromptSent = useRef(false);
  
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
  
  return {
    messages,
    isTyping,
    handleSendMessage
  };
};

export default useChatMessages; 