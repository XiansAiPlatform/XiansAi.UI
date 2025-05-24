import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuditingApi } from '../services/auditing-api';
import { useAuth } from '../auth/AuthContext';
import { useLocation } from 'react-router-dom';

const AuditContext = createContext();
const POLLING_INTERVAL = 120000; // 2 minutes
const MAX_CONSECUTIVE_FAILURES = 3;

export const AuditProvider = ({ children }) => {
    const [navErrorCount, setNavErrorCount] = useState(0);
    const [tabErrorCount, setTabErrorCount] = useState(0);
    const [lastCheckedTime, setLastCheckedTime] = useState(new Date());
    const lastCheckedTimeRef = useRef(new Date());
    const auditingApi = useAuditingApi();
    const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently, accessToken } = useAuth();
    const pollingIntervalRef = useRef(null);
    const [isTokenReady, setIsTokenReady] = useState(false);
    const location = useLocation();
    
    // Circuit breaker state - using refs to prevent unnecessary re-renders
    const consecutiveFailuresRef = useRef(0);
    const isCircuitOpenRef = useRef(false);
    const isApiCallInProgressRef = useRef(false);

    // Create a stable reference to fetchErrorCount (will be assigned after function definition)
    const fetchErrorCountRef = useRef();

    // Check if token is ready
    useEffect(() => {
        const checkToken = async () => {
            if (isAuthenticated && !authLoading) {
                try {
                    // Ensure we have an access token. 
                    // getAccessTokenSilently from useAuth might return it directly if already fetched,
                    // or fetch it if necessary.
                    const token = accessToken || await getAccessTokenSilently();
                    if (token) {
                        console.log('Access token is ready in ErrorNotificationContext');
                        setIsTokenReady(true);
                    } else {
                        // This case might indicate an issue with token retrieval not throwing an error
                        // but also not returning a token.
                        setIsTokenReady(false);
                        console.warn('Access token is null or undefined after checkToken.');
                    }
                } catch (error) {
                    console.error('Error getting access token in ErrorNotificationContext:', error);
                    setIsTokenReady(false);
                }
            } else {
                setIsTokenReady(false);
            }
        };
        
        // Add a short delay to ensure auth state is fully settled
        if (isAuthenticated && !authLoading) {
            const timer = setTimeout(() => {
                checkToken();
            }, 2*60*1000); // 2 minute delay
            return () => clearTimeout(timer);
        } else {
            setIsTokenReady(false);
        }
    }, [isAuthenticated, authLoading, getAccessTokenSilently, accessToken]);

    const fetchErrorCount = useCallback(async () => {
        // Skip if not authenticated, loading, token not ready, on home page, circuit open, or call in progress
        if (!isAuthenticated || authLoading || !isTokenReady || 
            location.pathname === '/' || location.pathname === '/register' ||
            isCircuitOpenRef.current || isApiCallInProgressRef.current) {
            console.log('Skipping fetchErrorCount:', { 
                isAuthenticated, 
                authLoading, 
                isTokenReady, 
                path: location.pathname,
                isCircuitOpen: isCircuitOpenRef.current,
                isApiCallInProgress: isApiCallInProgressRef.current
            });
            return;
        }

        isApiCallInProgressRef.current = true;

        try {
            const now = new Date();
            const startTime = lastCheckedTimeRef.current;    
            const result = await auditingApi.getCriticalLogs(
                startTime.toISOString(),
                now.toISOString()
            );
            
            // Success - reset circuit breaker state
            consecutiveFailuresRef.current = 0;
            isCircuitOpenRef.current = false;
            
            // Update lastCheckedTime immediately upon successful response
            lastCheckedTimeRef.current = now;
            setLastCheckedTime(now);
            
            // Calculate new errors since last check
            const newErrors = result.reduce((total, agentGroup) => {
                return total + agentGroup.workflowTypes.reduce((typeTotal, typeGroup) => {
                    return typeTotal + typeGroup.workflows.reduce((workflowTotal, workflow) => {
                        return workflowTotal + workflow.workflowRuns.reduce((runTotal, run) => {
                            const newLogsInThisRun = run.criticalLogs.filter(log => {
                                const logTime = new Date(log.createdAt);
                                const isNew = logTime > startTime;
                                return isNew;
                            });
                            return runTotal + newLogsInThisRun.length;
                        }, 0);
                    }, 0);
                }, 0);
            }, 0);

            if (newErrors > 0) {
                // Update both counts when new errors are found  
                setNavErrorCount(prev => prev + newErrors);
                setTabErrorCount(prev => prev + newErrors);
            }
        } catch (error) {
            console.error('Error fetching error count:', error);
            
            // Update circuit breaker state
            const newFailureCount = consecutiveFailuresRef.current + 1;
            consecutiveFailuresRef.current = newFailureCount;
            
            if (newFailureCount >= MAX_CONSECUTIVE_FAILURES) {
                console.warn(`Circuit breaker opened after ${newFailureCount} consecutive failures`);
                isCircuitOpenRef.current = true;
                
                // Auto-reset circuit breaker after 5 minutes
                setTimeout(() => {
                    console.log('Attempting to close circuit breaker after timeout');
                    isCircuitOpenRef.current = false;
                    consecutiveFailuresRef.current = 0; // Reset failure count on auto-recovery
                }, 300000); // 5 minutes
            }
        } finally {
            isApiCallInProgressRef.current = false;
        }
    }, [auditingApi, isAuthenticated, authLoading, isTokenReady, location.pathname]);

    // Assign the function to the ref after it's defined
    fetchErrorCountRef.current = fetchErrorCount;

    // Initial fetch
    useEffect(() => {
        if (isAuthenticated && !authLoading && isTokenReady) {
            // Delay the initial fetch to ensure token is fully processed
            const timer = setTimeout(() => {
                if (location.pathname !== '/' && location.pathname !== '/register') {
                    fetchErrorCount();
                }
            }, 2000); // 2 second delay after token is ready
            
            return () => clearTimeout(timer);
        }
    }, [fetchErrorCount, isAuthenticated, authLoading, isTokenReady, location.pathname]);

    // Setup polling
    useEffect(() => {
        const isAuditingPage = location.pathname.startsWith('/auditing');
        const isHomePage = location.pathname === '/';
        
        if (isAuthenticated && !authLoading && isTokenReady && !isAuditingPage && !isHomePage) {
            // Clear any existing interval
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }

            // Use a stable function that calls the current version
            const stablePollFunction = () => {
                if (fetchErrorCountRef.current) {
                    fetchErrorCountRef.current();
                }
            };

            // Use fixed interval - circuit breaker handles dynamic intervals internally
            pollingIntervalRef.current = setInterval(stablePollFunction, POLLING_INTERVAL);
            console.log(`Error notification polling started with interval: ${POLLING_INTERVAL}ms`);

            // Cleanup on unmount or when auth state changes
            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            };
        } else if ((isAuditingPage || isHomePage) && pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, [isAuthenticated, authLoading, isTokenReady, location.pathname]);

    // Handle nav error count reset when on auditing page
    useEffect(() => {
        const isAuditingPage = location.pathname.startsWith('/auditing');
        if (isAuditingPage && navErrorCount > 0) {
            setNavErrorCount(0);
        }
    }, [location.pathname, navErrorCount]);

    const resetNavErrorCount = useCallback(() => {
        setNavErrorCount(0);
    }, []);

    const resetTabErrorCount = useCallback(() => {
        setTabErrorCount(0);
    }, []);
    
    const resetAllErrorCounts = useCallback(() => {
        setNavErrorCount(0);
        setTabErrorCount(0);
        const now = new Date();
        lastCheckedTimeRef.current = now;
        setLastCheckedTime(now);
        // Reset circuit breaker state
        consecutiveFailuresRef.current = 0;
        isCircuitOpenRef.current = false;
    }, []);

    const resetCircuitBreaker = useCallback(() => {
        consecutiveFailuresRef.current = 0;
        isCircuitOpenRef.current = false;
        console.log('Circuit breaker manually reset');
    }, []);

    const updateLastCheckedTime = useCallback((newTime) => {
        lastCheckedTimeRef.current = newTime;
        setLastCheckedTime(newTime);
    }, []);

    return (
        <AuditContext.Provider value={{
            navErrorCount,
            tabErrorCount,
            lastCheckedTime,
            resetNavErrorCount,
            resetTabErrorCount,
            resetAllErrorCounts,
            resetCircuitBreaker,
            updateLastCheckedTime,
            isCircuitOpen: isCircuitOpenRef.current,
            consecutiveFailures: consecutiveFailuresRef.current
        }}>
            {children}
        </AuditContext.Provider>
    );
};

export const useAuditContext = () => {
    const context = useContext(AuditContext);
    if (!context) {
        throw new Error('useAuditContext must be used within an AuditProvider');
    }
    return context;
}; 