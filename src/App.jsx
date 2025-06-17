import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getConfig } from './config';
import Auth0ProviderWrapper from './modules/Manager/auth/auth0/Auth0ProviderWrapper';
import EntraIdProviderWrapper from './modules/Manager/auth/entraId/EntraIdProviderWrapper';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import lazyLoad from './utils/lazyLoad';

// Use lazyLoad utility for code splitting with prefetch
const AppRoutes = lazyLoad(() => import('./routes/AppRoutes'), { prefetch: true });

// Dynamically select the Auth Provider based on configuration
const AppAuthProvider = ({ children }) => {
  const config = getConfig();

  if (config.authProvider === 'entraId') {
    return <EntraIdProviderWrapper>{children}</EntraIdProviderWrapper>;
  }
  // Default to Auth0
  return <Auth0ProviderWrapper>{children}</Auth0ProviderWrapper>;
};

function App() {
  return (
    <BrowserRouter>
      <AppAuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
            <AppRoutes />
          </Suspense>
        </ErrorBoundary>
        <ToastContainer />
      </AppAuthProvider>
    </BrowserRouter>
  );
}

export default App; 
