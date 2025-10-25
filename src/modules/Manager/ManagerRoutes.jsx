import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuditProvider } from './contexts/AuditContext';
import WorkflowList from './Components/Runs/WorkflowList';
import WorkflowDetails from './Components/Runs/WorkflowDetails/WorkflowDetails';
import Layout from './Components/Layout/Layout';
import { SliderProvider } from './contexts/SliderContext';
import { LoadingProvider } from './contexts/LoadingContext';
import TenantThemeProvider from './theme/ThemeProvider';
import './theme/theme.css';
import Settings from './Components/Settings/Settings';
import Knowledge from './Components/Knowledge/Knowledge';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { TenantProvider } from './contexts/TenantContext';
import DefinitionsTabNavigation from './Components/Definitions/DefinitionsTabNavigation';
import DefinitionList from './Components/Definitions/DefinitionList';
import TemplatesList from './Components/Definitions/TemplatesList';
import NotImplemented from './Components/NotImplemented/NotImplemented';
import Landing from './Components/Landing/Landing';
import MessagingPage from './Components/Messaging/MessagingPage';
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth } from './auth/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuditingPage from './Components/Auditing/AuditingPage';
import { useNavigate } from 'react-router-dom';
import AdminDashboardRoute from './Components/Admin/AdminDashboardRoute';
import EnhancedLoadingSpinner from '../../components/EnhancedLoadingSpinner';

function ManagerRoutes() {
  const { logout, isLoading, error } = useAuth();

  if (error) {
    console.error(error);
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <EnhancedLoadingSpinner message="Loading..." />;
  }

  const handleLogout = () => {
    logout({ returnTo: window.location.origin + '/login' });
  };
  return (
    <NotificationProvider>
      <OrganizationProvider>
        <TenantProvider>
          <AuditProvider>
            <TenantThemeProvider>
              <ToastContainer />
              <LoadingProvider>
                <SliderProvider>
                  <Routes>
                    <Route path="logout" element={<LogoutHandler onLogout={handleLogout} />} />
                    <Route element={<Layout />}>
                      <Route path="landing" element={<Landing />} />
                      <Route path="runs" element={
                        <ProtectedRoute>
                          <WorkflowList />
                        </ProtectedRoute>
                      } />
                      <Route path="definitions/deployed" element={
                        <ProtectedRoute>
                          <DefinitionsTabNavigation>
                            <DefinitionList />
                          </DefinitionsTabNavigation>
                        </ProtectedRoute>
                      } />
                      <Route path="definitions/templates" element={
                        <ProtectedRoute>
                          <DefinitionsTabNavigation>
                            <TemplatesList />
                          </DefinitionsTabNavigation>
                        </ProtectedRoute>
                      } />
                      <Route path="definitions" element={<Navigate to="/manager/definitions/deployed" replace />} />
                      <Route path="runs/:id/:runId" element={
                        <ProtectedRoute>
                          <WorkflowDetails />
                        </ProtectedRoute>
                      } />
                      <Route path="agents" element={
                        <ProtectedRoute>
                          <NotImplemented />
                        </ProtectedRoute>
                      } />
                      <Route path="knowledge" element={
                        <ProtectedRoute>
                          <Knowledge />
                        </ProtectedRoute>
                      } />
                      <Route path="settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="messaging" element={
                        <ProtectedRoute>
                          <MessagingPage />
                        </ProtectedRoute>
                      } />
                      <Route path="auditing" element={
                        <ProtectedRoute>
                          <AuditingPage />
                        </ProtectedRoute>
                      } />
                      <Route path="admin" element={
                        <ProtectedRoute>
                          <AdminDashboardRoute />
                        </ProtectedRoute>
                      } />
                      {/* Default route for manager root */}
                      <Route index element={<Navigate to="/manager/definitions/deployed" replace />} />
                    </Route>
                  </Routes>
                </SliderProvider>
              </LoadingProvider>
            </TenantThemeProvider>
          </AuditProvider>
        </TenantProvider>
      </OrganizationProvider>
    </NotificationProvider>
  );
}

function LogoutHandler({ onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediately redirect to home page for better UX
    navigate('/');

    // Perform logout in the background
    onLogout();
  }, [onLogout, navigate]);

  return null;
}

export default ManagerRoutes; 
