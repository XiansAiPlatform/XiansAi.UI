import { useState, useRef, useEffect } from 'react';

const useScrollHandling = (messages) => {
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
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
  
  return {
    showScrollDown,
    messagesEndRef,
    scrollContainerRef,
    handleScroll,
    scrollToBottom
  };
};

export default useScrollHandling; 