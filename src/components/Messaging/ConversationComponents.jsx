import MessageItem from './MessageItem';
import ChatConversation from './ChatConversation';
import ConversationThreads from './ConversationThreads';

/**
 * @deprecated Use the individual component imports instead:
 * import { MessageItem, ChatConversation, ConversationThreads } from '../components/Messaging';
 */

// Re-export components for backwards compatibility
export { MessageItem, ChatConversation, ConversationThreads };

// Default export for backward compatibility
export default {
    MessageItem,
    ChatConversation,
    ConversationThreads
}; 