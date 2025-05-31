import React from 'react';
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
 * @param {string} props.message.content - Message content
 * @param {string} props.message.participantChannelId - Channel ID
 * @param {string} props.message.participantId - Participant ID (for incoming messages)
 * @param {string} props.message.workflowType - Workflow type (for outgoing messages)
 * @param {Object} [props.message.metadata] - Optional message metadata
 * @param {Array} [props.message.logs] - Optional message logs
 * @param {boolean} [props.isRecent] - Whether the message is recent (less than 1 minute old)
 */
const MessageItem = ({ message, isRecent = false }) => {
    console.log('Message content check:', {
        content: message.content,
        type: typeof message.content,
        messageId: message.id
    });

    // Check if message is a handover type
    const isHandover = message.direction === 'Handover';
    
    // Check if message content is null, undefined, empty, or just whitespace
    const isContentEmpty = !message.content || 
                          message.content === null || 
                          message.content === undefined || 
                          message.content === '' || 
                          message.content.toString().trim() === '' ||
                          message.content === 'null' ||
                          message.content === 'undefined';

    // Route to appropriate component based on message type
    if (isHandover) {
        return <HandoverMessage message={message} />;
    }
    
    if (isContentEmpty) {
        return <SystemMessage message={message} />;
    }
    
    return <RegularMessage message={message} isRecent={isRecent} />;
};

export default MessageItem; 