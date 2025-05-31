// Export main component
export { default } from './AgentChat';

// Export sub-components 
export { default as AgentIcon } from './AgentIcon';
export { default as ChatContainer } from './ChatContainer';
export { default as ChatHeader } from './ChatHeader';
export { default as EmptyState } from './EmptyState';
export { default as Message } from './Message';
export { default as MessageArea } from './MessageArea';
export { default as MessageInput } from './MessageInput';
export { default as ScrollDownButton } from './ScrollDownButton';
export { default as TypingIndicator } from './TypingIndicator';
export { default as WelcomeMessage } from './WelcomeMessage';

// Export hooks
export { default as useChatMessages } from './hooks/useChatMessages';
export { default as useInputFocus } from './hooks/useInputFocus';
export { default as useScrollHandling } from './hooks/useScrollHandling'; 