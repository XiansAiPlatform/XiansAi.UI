import { getConfig } from "../../../config";
import history from "../utils/history.js";

export const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
  window.location.href = '/runs';
};

const config = getConfig();

export const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  onRedirectCallback,
  cacheLocation: 'localstorage',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: config.audience
  },
}; 