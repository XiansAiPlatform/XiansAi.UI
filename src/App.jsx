import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import WorkflowList from './components/WorkflowList/WorkflowList';
import WorkflowDetails from './components/WorkflowDetails/WorkflowDetails';
import Layout from './components/Layout/Layout';
import { SliderProvider } from './contexts/SliderContext';
import { LoadingProvider } from './contexts/LoadingContext';
import Toaster from './components/Toaster/Toaster';
import ProtectedRoute from './auth/ProtectedRoute';
import Callback from './auth/Callback';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotImplemented from './components/NotImplemented/NotImplemented';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/mui-theme';
import Settings from './components/Settings/Settings';
import Instructions from './components/Instructions/Instructions';
import { OrganizationProvider } from './contexts/OrganizationContext';
import DefinitionList from './components/Definitions/DefinitionList';
import Home from './components/Public/Home/Home';
import Login from './auth/Login';
import Register from './components/Public/Register/Register';
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { isLoading, error, logout } = useAuth0();

  if (error) {
    console.error(error);
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  };

  return (
    <BrowserRouter>
        <NotificationProvider>
          <OrganizationProvider>
            <ThemeProvider theme={theme}>
              <LoadingProvider>
                <SliderProvider>
                  <Toaster />
                  <Routes>
                    <Route path="/callback" element={<Callback />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={ <Home /> } />
                    <Route path="/register" element={<Register />} />
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
                      <Route path="/runs/:id" element={
                        <ProtectedRoute>
                          <WorkflowDetails />
                        </ProtectedRoute>
                      } />
                      <Route path="/agents" element={
                        <ProtectedRoute>
                          <NotImplemented />
                        </ProtectedRoute>
                      } />
                      <Route path="/instructions" element={
                        <ProtectedRoute>
                          <Instructions />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                    </Route>
                  </Routes>
                </SliderProvider>
              </LoadingProvider>
            </ThemeProvider>
          </OrganizationProvider>
        </NotificationProvider>
        <ToastContainer />
    </BrowserRouter>
  );
}

function LogoutHandler({ onLogout }) {
  React.useEffect(() => {
    onLogout();
  }, [onLogout]);

  return null;
}

export default App; 