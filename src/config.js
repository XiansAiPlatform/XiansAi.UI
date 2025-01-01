import configJson from "./config.json";

export function getConfig() {

  return {
    domain: configJson.domain,
    clientId: configJson.clientId,
    audience: configJson.audience,
    apiBaseUrl: configJson.apiBaseUrl
  };
}
