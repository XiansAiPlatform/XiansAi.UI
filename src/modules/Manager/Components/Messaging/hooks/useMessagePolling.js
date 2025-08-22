import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for message polling functionality
 * 
 * @param {Object} options
 * @param {string} options.threadId - ID of the thread to poll messages for
 * @param {Function} options.fetchMessages - Function to fetch thread messages
 * @param {number} options.pollingInterval - Interval in ms between polls (default: 5000)
 * @param {number} options.pollingDuration - Duration in ms to poll for (default: 60000 = 60 seconds)
 * @param {number[]} [options.scheduleDelays] - Optional list of delays (ms) for each poll attempt. If provided, overrides interval/duration behavior.
 * @param {Function} [options.onStarted] - Optional callback invoked when polling begins.
 * @returns {Object} - Object containing polling control functions
 */
const useMessagePolling = ({
    threadId,
    fetchMessages,
    pollingInterval = 3000,
    pollingDuration = 60000, // 60 seconds default
    scheduleDelays,
    onStarted
}) => {
    const pollingTimerRef = useRef(null);
    const pollingEndTimeRef = useRef(null);
    const attemptIndexRef = useRef(0);
    const delaysRef = useRef(null);
    
    // Stop message polling
    const stopPolling = useCallback(() => {
        if (pollingTimerRef.current) {
            clearTimeout(pollingTimerRef.current);
            pollingTimerRef.current = null;
        }
        pollingEndTimeRef.current = null;
        attemptIndexRef.current = 0;
        delaysRef.current = null;
    }, []);
    
    // Start polling for message updates for a limited duration
    const startPolling = useCallback((id) => {
        // Use the passed threadId parameter or fall back to the one from options
        const threadToUse = id || threadId;
        
        // Clear any existing polling
        stopPolling();
        if (onStarted) {
            try { onStarted(); } catch (_) {}
        }
        
        // If an explicit delay schedule is provided, use that (overrides duration/interval)
        if (Array.isArray(scheduleDelays) && scheduleDelays.length > 0) {
            delaysRef.current = [...scheduleDelays];
            attemptIndexRef.current = 0;
            
            const pollWithSchedule = () => {
                // Check if thread ID is still valid
                if (!threadToUse) {
                    stopPolling();
                    return;
                }
                
                // Execute poll
                fetchMessages(threadToUse, 1, true);
                
                // Determine next attempt
                attemptIndexRef.current += 1;
                if (!delaysRef.current || attemptIndexRef.current >= delaysRef.current.length) {
                    stopPolling();
                    return;
                }
                
                const nextDelay = delaysRef.current[attemptIndexRef.current];
                pollingTimerRef.current = setTimeout(pollWithSchedule, nextDelay);
            };
            
            // Kick off first attempt after the first delay
            const initialDelay = delaysRef.current[0];
            pollingTimerRef.current = setTimeout(pollWithSchedule, initialDelay);
            return;
        }

        // Default behavior: fixed interval for a total duration
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
    }, [threadId, fetchMessages, pollingInterval, pollingDuration, stopPolling, scheduleDelays, onStarted]);

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