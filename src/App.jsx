import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getConfig } from './config';
import Auth0ProviderWrapper from './modules/Manager/auth/auth0/Auth0ProviderWrapper';
import EntraIdProviderWrapper from './modules/Manager/auth/entraId/EntraIdProviderWrapper';
import KeycloakProviderWrapper from './modules/Manager/auth/keycloak/KeycloakProviderWrapper';
import GlobalAccountConflictProvider from './modules/Manager/Components/Common/GlobalAccountConflictProvider';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import lazyLoad from './utils/lazyLoad';

// Use lazyLoad utility for code splitting with prefetch
const AppRoutes = lazyLoad(() => import('./routes/AppRoutes'), { prefetch: true });

// Dynamically select the Auth Provider based on configuration
const AppAuthProvider = ({ children }) => {
  const config = getConfig();

  switch (config.authProvider) {
    case "entraId":
      return <EntraIdProviderWrapper>{children}</EntraIdProviderWrapper>;
    case "keycloak":
      return <KeycloakProviderWrapper>{children}</KeycloakProviderWrapper>;
    case "auth0":
      return <Auth0ProviderWrapper>{children}</Auth0ProviderWrapper>;
    default:
      // Default to Auth0
      throw new Error(`Unsupported auth provider: ${config.authProvider}`);
  }
};

function App() {
  return (
    <BrowserRouter>
      <AppAuthProvider>
        <GlobalAccountConflictProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
              <AppRoutes />
            </Suspense>
          </ErrorBoundary>
        </GlobalAccountConflictProvider>
        <ToastContainer />
      </AppAuthProvider>
    </BrowserRouter>
  );
}

export default App; 
