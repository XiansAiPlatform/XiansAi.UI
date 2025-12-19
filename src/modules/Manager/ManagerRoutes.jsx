import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuditProvider } from './contexts/AuditContext';
import WorkflowList from './Components/Runs/WorkflowList';
import WorkflowDetails from './Components/Runs/WorkflowDetails/WorkflowDetails';
import ScheduleList from './Components/Schedules/ScheduleList';
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
import UsageStatistics from './Components/UsageStatistics/UsageStatistics';

function ManagerRoutes() {
  const { logout, isLoading, error } = useAuth();

  if (error) {
    console.error(error);
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '40px',
          maxWidth: '500px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>⚠️</div>
          <h2 style={{
            margin: '0 0 16px 0',
            fontSize: '24px',
            color: '#333'
          }}>Something Went Wrong</h2>
          <p style={{
            margin: '0 0 24px 0',
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            We encountered an error while loading the application. Please try refreshing the page.
          </p>
          {error.message && (
            <p style={{
              margin: '0 0 24px 0',
              padding: '12px',
              backgroundColor: '#f8f8f8',
              borderRadius: '4px',
              color: '#999',
              fontSize: '14px',
              fontFamily: 'monospace',
              wordBreak: 'break-word'
            }}>
              {error.message}
            </p>
          )}
          <button
            onClick={() => window.location.href = '/manager/'}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1565c0'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1976d2'}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return null; // LoadingContext will show the top progress bar
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
                      <Route path="schedules" element={
                        <ProtectedRoute>
                          <ScheduleList />
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
                      <Route path="usage-statistics" element={
                        <ProtectedRoute>
                          <UsageStatistics />
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
