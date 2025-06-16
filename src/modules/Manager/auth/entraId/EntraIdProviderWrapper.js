import { AuthProvider as GenericAuthProvider } from '../AuthContext';
import EntraIdService from './EntraIdService';
// MsalProvider from @azure/msal-react is needed to provide msal instance to hooks like useMsal
import { MsalProvider } from '@azure/msal-react';

const EntraIdProviderWrapper = ({ children }) => {
  // Instantiate the EntraIdService. This service class itself doesn't use MsalProvider directly,
  // but components deeper in the tree might use useMsal() or other MSAL React hooks.
  const entraIdServiceInstance = new EntraIdService();

  return (
    <MsalProvider instance={entraIdServiceInstance.publicClientApplication}>
      <GenericAuthProvider provider={entraIdServiceInstance}>
        {children}
      </GenericAuthProvider>
    </MsalProvider>
  );
};

export default EntraIdProviderWrapper; 