import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuditingApi } from '../services/auditing-api';
import { useAuth } from '../auth/AuthContext';
import { useLocation } from 'react-router-dom';

const ErrorNotificationContext = createContext();
const POLLING_INTERVAL = 30000; // 30 seconds

export const ErrorNotificationProvider = ({ children }) => {
    const [navErrorCount, setNavErrorCount] = useState(0);
    const [tabErrorCount, setTabErrorCount] = useState(0);
    const [lastCheckedTime, setLastCheckedTime] = useState(new Date());
    const lastCheckedTimeRef = useRef(new Date());
    const auditingApi = useAuditingApi();
    const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently, accessToken } = useAuth();
    const pollingIntervalRef = useRef(null);
    const [isTokenReady, setIsTokenReady] = useState(false);
    const location = useLocation();

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
            }, 1000); // 1 second delay
            return () => clearTimeout(timer);
        } else {
            setIsTokenReady(false);
        }
    }, [isAuthenticated, authLoading, getAccessTokenSilently, accessToken]);

    const fetchErrorCount = useCallback(async () => {
        // Skip if not authenticated, loading, token not ready, or on home page
        if (!isAuthenticated || authLoading || !isTokenReady || location.pathname === '/' || location.pathname === '/register') {
            console.log('Skipping fetchErrorCount:', { 
                isAuthenticated, 
                authLoading, 
                isTokenReady, 
                path: location.pathname 
            });
            return;
        }

        // Add a small retry mechanism with backoff
        let retries = 0;
        const maxRetries = 3;

        try {
            const executeRequest = async () => {
                try {
                    const now = new Date();
                    const startTime = lastCheckedTimeRef.current;
                    
                    console.log('Fetching critical logs from', startTime.toISOString(), 'to', now.toISOString());
                    
                    const result = await auditingApi.getCriticalLogs(
                        startTime.toISOString(),
                        now.toISOString()
                    );
                    
                    // Update lastCheckedTime immediately upon successful response
                    lastCheckedTimeRef.current = now;
                    setLastCheckedTime(now);
                    
                    // Calculate new errors since last check
                    const newErrors = result.reduce((total, agentGroup) => {
                        return total + agentGroup.workflowTypes.reduce((typeTotal, typeGroup) => {
                            return typeTotal + typeGroup.workflows.reduce((workflowTotal, workflow) => {
                                return workflowTotal + workflow.workflowRuns.reduce((runTotal, run) => {
                                    return runTotal + run.criticalLogs.filter(log => 
                                        new Date(log.createdAt) > lastCheckedTimeRef.current
                                    ).length;
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
                    throw error; // Rethrow to trigger retry logic
                }
            };

            await executeRequest();
        } catch (error) {
            if (retries < maxRetries) {
                retries++;
                console.log(`Retry attempt ${retries} for fetchErrorCount`);
                setTimeout(() => fetchErrorCount(), 1000 * retries); // Backoff with each retry
            } else {
                console.error('Max retries reached. Unable to fetch error count.');
            }
        }
    }, [auditingApi, isAuthenticated, authLoading, isTokenReady, location.pathname]);

    // Initial fetch
    useEffect(() => {
        if (isAuthenticated && !authLoading && isTokenReady) {
            // Delay the initial fetch to ensure token is fully processed
            const timer = setTimeout(() => {
                if (location.pathname !== '/' && location.pathname !== '/register') {
                    console.log('Running initial error count fetch');
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
                console.log('ErrorNotificationContext: Clearing existing polling interval');
                clearInterval(pollingIntervalRef.current);
            }

            pollingIntervalRef.current = setInterval(fetchErrorCount, POLLING_INTERVAL);

            // Cleanup on unmount or when auth state changes
            return () => {
                if (pollingIntervalRef.current) {
                    console.log('ErrorNotificationContext: Cleaning up polling interval');
                    clearInterval(pollingIntervalRef.current);
                }
            };
        } else if ((isAuditingPage || isHomePage) && pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, [fetchErrorCount, isAuthenticated, authLoading, isTokenReady, location.pathname]);

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
    }, []);

    const updateLastCheckedTime = useCallback((newTime) => {
        lastCheckedTimeRef.current = newTime;
        setLastCheckedTime(newTime);
    }, []);

    return (
        <ErrorNotificationContext.Provider value={{
            navErrorCount,
            tabErrorCount,
            lastCheckedTime,
            resetNavErrorCount,
            resetTabErrorCount,
            resetAllErrorCounts,
            updateLastCheckedTime
        }}>
            {children}
        </ErrorNotificationContext.Provider>
    );
};

export const useErrorNotification = () => {
    const context = useContext(ErrorNotificationContext);
    if (!context) {
        throw new Error('useErrorNotification must be used within an ErrorNotificationProvider');
    }
    return context;
}; 