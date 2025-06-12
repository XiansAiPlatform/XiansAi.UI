import HandoverMessage from './HandoverMessage';
import SystemMessage from './SystemMessage';
import RegularMessage from './RegularMessage';

/**
 * Router component that renders the appropriate message component based on message type
 * 
 * @param {Object} props
 * @param {Object} props.message - The message object to display
 * @param {string} props.message.id - Message ID
 * @param {string} props.message.threadId - Thread ID
 * @param {string} props.message.tenantId - Tenant ID
 * @param {string} props.message.direction - 'Incoming', 'Outgoing', or 'Handover'
 * @param {string} props.message.status - Message status
 * @param {string} props.message.createdAt - Creation timestamp
 * @param {string} props.message.createdBy - User who created the message
 * @param {string} props.message.text - Message text
 * @param {string} props.message.participantChannelId - Channel ID
 * @param {string} props.message.participantId - Participant ID (for incoming messages)
 * @param {string} props.message.workflowType - Workflow type (for outgoing messages)
 * @param {Object} [props.message.data] - Optional message data
 * @param {Array} [props.message.logs] - Optional message logs
 * @param {boolean} [props.isRecent] - Whether the message is recent (less than 1 minute old)
 */
const MessageItem = ({ message, isRecent = false }) => {
    // Debugging information (only output for first message or every 10th message)
    const shouldLog = message.id === 'first' || (message.id && message.id.endsWith('0'));
    if (shouldLog) {
        console.log('Rendering message:', {
            id: message.id,
            text: message.text,
            type: typeof message.text,
            messageId: message.id
        });
    }

    // Check if message is a handover type
    const isHandover = message.messageType === 'Handoff';
    const isData = message.messageType === 'Data';

    // Route to appropriate component based on message type
    if (isHandover) {
        return <HandoverMessage message={message} />;
    }
    else if (isData) {
        return <SystemMessage message={message} />;
    }

    return <RegularMessage message={message} isRecent={isRecent} />;
};

export default MessageItem; 