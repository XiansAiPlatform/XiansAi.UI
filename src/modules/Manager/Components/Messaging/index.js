// Export all message components for easier importing
export { default as MessageItem } from './Conversation/MessageItem';
export { default as HandoverMessage } from './Conversation/HandoverMessage';
export { default as SystemMessage } from './Conversation/SystemMessage';
export { default as RegularMessage } from './Conversation/RegularMessage';

// Re-export other messaging components for completeness
export { default as ChatHeader } from './ChatHeader';
export { default as SendMessageForm } from './SendMessageForm';
export { default as AgentSelector } from './AgentSelector';
export { default as MessagingPage } from './MessagingPage';
export { default as ChatConversation } from './Conversation/ChatConversation';
export { default as TypingIndicator } from './Conversation/TypingIndicator';
export { default as MessagesList } from './Conversation/MessagesList';
export { default as ConversationThreads } from './ConversationThreads';
export { default as RegisterWebhookForm } from './RegisterWebhookForm';
export { default as WorkflowActions } from './WorkflowActions'; 