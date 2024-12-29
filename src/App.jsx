import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { NotificationProvider } from './contexts/NotificationContext';
import WorkflowList from './components/WorkflowList/WorkflowList';
import WorkflowDetails from './components/WorkflowDetails/WorkflowDetails';
import Layout from './components/Layout/Layout';
import { SliderProvider } from './contexts/SliderContext';
import { LoadingProvider } from './contexts/LoadingContext';
import Toaster from './components/Toaster/Toaster';
import ProtectedRoute from './auth/ProtectedRoute';
import Callback from './auth/Callback';
import { getConfig } from "./config";
import { createBrowserHistory } from "history";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotImplemented from './components/NotImplemented/NotImplemented';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/mui-theme';

function App() {
  const config = getConfig();

  const onRedirectCallback = (appState) => {
    var history = createBrowserHistory();
    history.push(
      appState && appState.returnTo ? appState.returnTo : '/callback'
    );
  };
  const providerConfig = {
    domain: config.domain,
    clientId: config.clientId,
    onRedirectCallback,
    authorizationParams: {
      redirect_uri: window.location.origin,
      ...(config.audience ? { audience: config.audience } : null),
    },
  };


  return (
    <BrowserRouter>
      <Auth0Provider
        {...providerConfig}
      >
        <ThemeProvider theme={theme}>

        <NotificationProvider>
          <LoadingProvider>
            <SliderProvider>
              <Toaster />
              <Layout>
                <Routes>
                  <Route path="/callback" element={<Callback />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <WorkflowList />
                    </ProtectedRoute>
                  } />
                  <Route path="/runs" element={
                    <ProtectedRoute>
                      <WorkflowList />
                    </ProtectedRoute>
                  } />
                  <Route path="/runs/:id" element={
                    <ProtectedRoute>
                      <WorkflowDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/definitions" element={
                    <ProtectedRoute>
                      <NotImplemented />
                    </ProtectedRoute>
                  } />
                  <Route path="/agents" element={
                    <ProtectedRoute>
                      <NotImplemented />
                    </ProtectedRoute>
                  } />
                  <Route path="/instructions" element={
                    <ProtectedRoute>
                      <NotImplemented />
                    </ProtectedRoute>
                  } />    
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <NotImplemented />
                    </ProtectedRoute>
                  } />                                                                      
                </Routes>
              </Layout>
            </SliderProvider>
          </LoadingProvider>
        </NotificationProvider>
        </ThemeProvider>
      </Auth0Provider>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App; 