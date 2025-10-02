import { AuthProvider as GenericAuthProvider } from '../AuthContext';
import GenericOidcService from './GenericOidcService';

const GenericOidcProviderWrapper = ({ children }) => {
  // Instantiate the GenericOidcService
  const genericOidcServiceInstance = new GenericOidcService();

  return (
    <GenericAuthProvider provider={genericOidcServiceInstance}>
      {children}
    </GenericAuthProvider>
  );
};

export default GenericOidcProviderWrapper;
