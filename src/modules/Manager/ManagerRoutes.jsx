import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import WorkflowList from './Components/Runs/WorkflowList';
import WorkflowDetails from './Components/Runs/WorkflowDetails/WorkflowDetails';
import Layout from './Components/Layout/Layout';
import { SliderProvider } from './contexts/SliderContext';
import { LoadingProvider } from './contexts/LoadingContext';
import Toaster from './Components/Common/Toaster/Toaster';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/mui-theme';
import Settings from './Components/Settings/Settings';
import Knowledge from './Components/Knowledge/Knowledge';
import { OrganizationProvider } from './contexts/OrganizationContext';
import DefinitionList from './Components/Definitions/DefinitionList';
import NotImplemented from './Components/NotImplemented/NotImplemented';
import MessagingPage from './Components/Messaging/MessagingPage';
import ProtectedRoute from '../../auth/ProtectedRoute';

function ManagerRoutes() {
  return (
    <NotificationProvider>
      <OrganizationProvider>
        <ThemeProvider theme={theme}>
          <LoadingProvider>
            <SliderProvider>
              <Toaster />
              <Routes>
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
                </Route>
              </Routes>
            </SliderProvider>
          </LoadingProvider>
        </ThemeProvider>
      </OrganizationProvider>
    </NotificationProvider>
  );
}

export default ManagerRoutes; 