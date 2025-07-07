import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for message polling functionality
 * 
 * @param {Object} options
 * @param {string} options.threadId - ID of the thread to poll messages for
 * @param {Function} options.fetchMessages - Function to fetch thread messages
 * @param {number} options.pollingInterval - Interval in ms between polls (default: 5000)
 * @param {number} options.pollingDuration - Duration in ms to poll for (default: 60000 = 60 seconds)
 * @returns {Object} - Object containing polling control functions
 */
const useMessagePolling = ({
    threadId,
    fetchMessages,
    pollingInterval = 3000,
    pollingDuration = 60000 // 60 seconds default
}) => {
    const pollingTimerRef = useRef(null);
    const pollingEndTimeRef = useRef(null);
    
    // Stop message polling
    const stopPolling = useCallback(() => {
        if (pollingTimerRef.current) {
            clearTimeout(pollingTimerRef.current);
            pollingTimerRef.current = null;
        }
        pollingEndTimeRef.current = null;
    }, []);
    
    // Start polling for message updates for a limited duration
    const startPolling = useCallback((id) => {
        // Use the passed threadId parameter or fall back to the one from options
        const threadToUse = id || threadId;
        
        // Clear any existing polling
        stopPolling();
        
        // Set the end time for polling
        pollingEndTimeRef.current = Date.now() + pollingDuration;
        
        // Define the polling function
        const pollMessages = () => {
            // Check if polling duration has expired
            if (Date.now() >= pollingEndTimeRef.current) {
                stopPolling();
                return;
            }
            
            // Check if thread ID is still valid
            if (!threadToUse) {
                stopPolling();
                return;
            }
            
            // Fetch messages with polling flag set to true
            fetchMessages(threadToUse, 1, true);
            
            // Schedule the next poll
            pollingTimerRef.current = setTimeout(pollMessages, pollingInterval);
        };
        
        // Start the first poll after the interval
        pollingTimerRef.current = setTimeout(pollMessages, pollingInterval);
    }, [threadId, fetchMessages, pollingInterval, pollingDuration, stopPolling]);

    // Start polling immediately when triggered (e.g., after sending a message)
    const triggerPolling = useCallback((id) => {
        const threadToUse = id || threadId;
        
        if (!threadToUse) {
            return;
        }
        
        startPolling(threadToUse);
    }, [startPolling, threadId]);
    
    // Clean up polling on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);
    
    return {
        startPolling,
        stopPolling,
        triggerPolling,
        isPolling: !!pollingTimerRef.current
    };
};

export default useMessagePolling; 