import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuditingApi } from '../services/auditing-api';
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from 'react-router-dom';

const ErrorNotificationContext = createContext();
const POLLING_INTERVAL = 30000; // 30 seconds

export const ErrorNotificationProvider = ({ children }) => {
    const [navErrorCount, setNavErrorCount] = useState(0);
    const [tabErrorCount, setTabErrorCount] = useState(0);
    const [lastCheckedTime, setLastCheckedTime] = useState(new Date());
    const lastCheckedTimeRef = useRef(new Date());
    const auditingApi = useAuditingApi();
    const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
    const pollingIntervalRef = useRef(null);
    const [isTokenReady, setIsTokenReady] = useState(false);
    const location = useLocation();

    // Check if token is ready
    useEffect(() => {
        const checkToken = async () => {
            if (isAuthenticated && !authLoading) {
                try {
                    await getAccessTokenSilently();
                    setIsTokenReady(true);
                } catch (error) {
                    console.error('Error getting access token:', error);
                    setIsTokenReady(false);
                }
            } else {
                setIsTokenReady(false);
            }
        };
        checkToken();
    }, [isAuthenticated, authLoading, getAccessTokenSilently]);

    const fetchErrorCount = useCallback(async () => {
        // Skip if not authenticated, loading, token not ready, or on home page
        if (!isAuthenticated || authLoading || !isTokenReady || location.pathname === '/') return;

        try {
            const now = new Date();
            const startTime = lastCheckedTimeRef.current;
            
            const result = await auditingApi.getCriticalLogs(
                startTime.toISOString(),
                now.toISOString()
            );

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
            lastCheckedTimeRef.current = now;
            setLastCheckedTime(now);
        } catch (error) {
            console.error('Error fetching error count:', error);
        }
    }, [auditingApi, isAuthenticated, authLoading, isTokenReady, location.pathname]);

    // Initial fetch
    useEffect(() => {
        if (isAuthenticated && !authLoading && isTokenReady && location.pathname !== '/') {
            fetchErrorCount();
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