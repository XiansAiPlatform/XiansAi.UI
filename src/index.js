import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';
import { getConfig } from "./config";
import { Auth0Provider } from "@auth0/auth0-react";
import history from "./utils/history";


const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
  window.location.href = '/runs';
};

const config = getConfig();

console.log("config", config);

const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  onRedirectCallback,
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: config.audience
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Auth0Provider
    {...providerConfig}
  >
    <App />
  </Auth0Provider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
