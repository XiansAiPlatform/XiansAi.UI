import { AuthProvider as GenericAuthProvider } from '../AuthContext';
import OidcService from './OidcService';

const OidcProviderWrapper = ({ children }) => {
  // Instantiate the OidcService
  // This instance will be passed to the GenericAuthProvider
  const oidcServiceInstance = new OidcService();

  return (
    <GenericAuthProvider provider={oidcServiceInstance}>
      {children}
    </GenericAuthProvider>
  );
};

export default OidcProviderWrapper;

