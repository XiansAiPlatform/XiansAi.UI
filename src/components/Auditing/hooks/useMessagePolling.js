import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for message polling functionality
 * 
 * @param {Object} options
 * @param {string} options.threadId - ID of the thread to poll messages for
 * @param {Function} options.fetchMessages - Function to fetch thread messages
 * @param {number} options.pollingInterval - Interval in ms between polls (default: 5000)
 * @param {number} options.maxPollingCount - Max number of polls before stopping (default: 24)
 * @returns {Object} - Object containing polling control functions
 */
const useMessagePolling = ({
    threadId,
    fetchMessages,
    pollingInterval = 5000,
    maxPollingCount = 24 // 2 minutes with 5s interval
}) => {
    const pollingTimerRef = useRef(null);
    const pollingCountRef = useRef(0);
    
    // Stop message polling
    const stopPolling = useCallback(() => {
        if (pollingTimerRef.current) {
            clearTimeout(pollingTimerRef.current);
            pollingTimerRef.current = null;
        }
    }, []);
    
    // Start polling for message updates
    const startPolling = useCallback((id) => {
        // Use the passed threadId parameter or fall back to the one from options
        const threadToUse = id || threadId;
        
        // Clear any existing polling
        stopPolling();
        
        // Reset the polling counter
        pollingCountRef.current = 0;
        
        console.log('Starting message polling for 2 minutes');
        
        // Define the polling function
        const pollMessages = () => {
            pollingCountRef.current += 1;
            
            // Check if we've reached the max polling count
            if (pollingCountRef.current > maxPollingCount) {
                console.log('Message polling completed after 2 minutes');
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
    }, [threadId, fetchMessages, pollingInterval, maxPollingCount, stopPolling]);
    
    // Clean up polling on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);
    
    return {
        startPolling,
        stopPolling,
        isPolling: !!pollingTimerRef.current
    };
};

export default useMessagePolling; 