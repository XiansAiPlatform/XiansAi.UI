import { AuthProvider as GenericAuthProvider } from '../AuthContext';
import Auth0Service from './Auth0Service';

const Auth0ProviderWrapper = ({ children }) => {
  // Instantiate the Auth0Service
  // This instance will be passed to the GenericAuthProvider
  // We can memoize this instance if needed, but for now, a direct instantiation is fine
  // as AuthProvider in AuthContext will manage its lifecycle based on this prop.
  const auth0ServiceInstance = new Auth0Service();

  return (
    <GenericAuthProvider provider={auth0ServiceInstance}>
      {children}
    </GenericAuthProvider>
  );
};

export default Auth0ProviderWrapper; 