import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for real-time message streaming using Server-Sent Events (SSE)
 * 
 * @param {Object} options
 * @param {string} options.threadId - ID of the thread to stream messages for
 * @param {Function} options.onMessageReceived - Callback when a new message is received
 * @param {Function} options.messagingApi - API hook for messaging operations
 * @param {Function} options.onError - Callback when an error occurs
 * @returns {Object} - Object containing streaming control functions
 */
const useMessageStreaming = ({
    threadId,
    onMessageReceived,
    messagingApi,
    onError
}) => {
    const abortControllerRef = useRef(null);
    const isStreamingRef = useRef(false);
    
    // Stop message streaming
    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            console.log('Stopping message stream for thread:', threadId);
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            isStreamingRef.current = false;
        }
    }, [threadId]);
    
    // Start streaming for message updates
    const startStreaming = useCallback(async (id) => {
        // Use the passed threadId parameter or fall back to the one from options
        const threadToUse = id || threadId;
        
        if (!threadToUse) {
            console.warn('Cannot start streaming: no thread ID provided');
            return;
        }
        
        // Clear any existing stream
        stopStreaming();
        
        console.log('Starting message stream for thread:', threadToUse);
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        isStreamingRef.current = true;
        
        try {
            // Start the SSE stream with abort signal
            await messagingApi.streamThreadMessages(
                threadToUse, 
                (event) => {
                    // Handle different event types
                    if (event.event === 'connected') {
                        console.log('[SSE] Connection established for thread:', threadToUse);
                    } else if (event.event === 'heartbeat') {
                        // Only log heartbeats in development or if needed for debugging
                        // Reduced logging to prevent browser slowdown
                    } else if (event.event === 'Chat' || event.event === 'Data' || event.event === 'Handoff') {
                        // This is a message event - call the callback
                        console.log('[SSE] Received message:', event.event);
                        if (onMessageReceived) {
                            onMessageReceived(event.data);
                        }
                    }
                },
                abortControllerRef.current.signal
            );
        } catch (error) {
            // Only report errors if they're not from aborting the connection
            if (error.name !== 'AbortError' && abortControllerRef.current) {
                console.error('[SSE] Error in message stream:', error);
                if (onError) {
                    onError(error);
                }
            }
        } finally {
            // Clean up if the stream ends
            if (abortControllerRef.current) {
                isStreamingRef.current = false;
            }
        }
    }, [threadId, messagingApi, onMessageReceived, onError, stopStreaming]);
    
    // Clean up streaming on unmount
    useEffect(() => {
        return () => {
            stopStreaming();
        };
    }, [stopStreaming]);
    
    return {
        startStreaming,
        stopStreaming,
        isStreaming: isStreamingRef.current
    };
};

export default useMessageStreaming;

