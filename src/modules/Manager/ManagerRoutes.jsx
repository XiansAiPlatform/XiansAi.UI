import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuditProvider } from './contexts/AuditContext';
import WorkflowList from './Components/Runs/WorkflowList';
import WorkflowDetails from './Components/Runs/WorkflowDetails/WorkflowDetails';
import Layout from './Components/Layout/Layout';
import { SliderProvider } from './contexts/SliderContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/mui-theme';
import './theme/theme.css';
import Settings from './Components/Settings/Settings';
import Knowledge from './Components/Knowledge/Knowledge';
import { OrganizationProvider } from './contexts/OrganizationContext';
import DefinitionList from './Components/Definitions/DefinitionList';
import NotImplemented from './Components/NotImplemented/NotImplemented';
import MessagingPage from './Components/Messaging/MessagingPage';
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth } from './auth/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuditingPage from './Components/Auditing/AuditingPage';

function ManagerRoutes() {
  const { logout, isLoading, error } = useAuth();

  if (error) {
    console.error(error);
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    logout({ returnTo: window.location.origin + '/login' });
  };

  return (
    <NotificationProvider>
      <OrganizationProvider>
        <AuditProvider>
          <ThemeProvider theme={theme}>
            <ToastContainer />
            <LoadingProvider>
              <SliderProvider>
                <Routes>
                  <Route path="/logout" element={<LogoutHandler onLogout={handleLogout} />} />
                  <Route element={<Layout />}>
                    <Route path="/runs" element={
                      <ProtectedRoute>
                        <WorkflowList />
                      </ProtectedRoute>
                    } />
                    <Route path="/definitions" element={
                      <ProtectedRoute>
                        <DefinitionList />
                      </ProtectedRoute>
                    } />
                    <Route path="/runs/:id/:runId" element={
                      <ProtectedRoute>
                        <WorkflowDetails />
                      </ProtectedRoute>
                    } />
                    <Route path="/agents" element={
                      <ProtectedRoute>
                        <NotImplemented />
                      </ProtectedRoute>
                    } />
                    <Route path="/knowledge" element={
                      <ProtectedRoute>
                        <Knowledge />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } />
                    <Route path="/messaging" element={
                      <ProtectedRoute>
                        <MessagingPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/auditing" element={
                      <ProtectedRoute>
                        <AuditingPage />
                      </ProtectedRoute>
                    } />
                  </Route>
                </Routes>
              </SliderProvider>
            </LoadingProvider>
          </ThemeProvider>
        </AuditProvider>
      </OrganizationProvider>
    </NotificationProvider>
  );
}

function LogoutHandler({ onLogout }) {
  React.useEffect(() => {
    onLogout();
  }, [onLogout]);

  return null;
}

export default ManagerRoutes; 