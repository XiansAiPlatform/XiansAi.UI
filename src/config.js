import configJson from "./config.json";

export function getConfig() {

  return {
    domain: configJson.domain,
    clientId: configJson.clientId,
    audience: configJson.audience,
    apiBaseUrl: process.env.REACT_APP_API_URL || configJson.apiBaseUrl 
  };
}
