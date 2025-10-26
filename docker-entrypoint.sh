#!/bin/sh

# Docker entrypoint script for XiansAi UI
# This script replaces runtime configuration placeholders before starting nginx

set -e

echo "🔧 Configuring runtime environment..."

# Path to the config file
CONFIG_FILE="/usr/share/nginx/html/config.js"

# Function to replace environment variables in config file
replace_env_vars() {
  echo "📝 Updating runtime configuration..."
  
  # Use envsubst to replace environment variables
  # Only replace variables that are actually set

  echo "Configuration for application branding"
  export REACT_APP_NAME="${REACT_APP_NAME:-Xians.ai}"
  echo "REACT_APP_NAME: $REACT_APP_NAME"

  echo "Configuration for general environment"
  export REACT_APP_AUTH_PROVIDER="${REACT_APP_AUTH_PROVIDER:-auth0}"
  echo "REACT_APP_AUTH_PROVIDER: $REACT_APP_AUTH_PROVIDER"

  export REACT_APP_API_URL="${REACT_APP_API_URL:-}"
  echo "REACT_APP_API_URL: $REACT_APP_API_URL"

  echo "Configuration for keycloak"
  export REACT_APP_KEYCLOAK_URL="${REACT_APP_KEYCLOAK_URL:-}"
  echo "REACT_APP_KEYCLOAK_URL: $REACT_APP_KEYCLOAK_URL"

  export REACT_APP_KEYCLOAK_REALM="${REACT_APP_KEYCLOAK_REALM:-}"
  echo "REACT_APP_KEYCLOAK_REALM: $REACT_APP_KEYCLOAK_REALM"

  export REACT_APP_KEYCLOAK_CLIENT_ID="${REACT_APP_KEYCLOAK_CLIENT_ID:-}"
  echo "REACT_APP_KEYCLOAK_CLIENT_ID: $REACT_APP_KEYCLOAK_CLIENT_ID"
  
  echo "Configuration for auth0"
  export REACT_APP_AUTH0_DOMAIN="${REACT_APP_AUTH0_DOMAIN:-}"
  echo "REACT_APP_AUTH0_DOMAIN: $REACT_APP_AUTH0_DOMAIN"

  export REACT_APP_AUTH0_CLIENT_ID="${REACT_APP_AUTH0_CLIENT_ID:-}"
  echo "REACT_APP_AUTH0_CLIENT_ID: $REACT_APP_AUTH0_CLIENT_ID"

  export REACT_APP_AUTH0_AUDIENCE="${REACT_APP_AUTH0_AUDIENCE:-}"
  echo "REACT_APP_AUTH0_AUDIENCE: $REACT_APP_AUTH0_AUDIENCE"

  echo "Configuration for entraId"
  export REACT_APP_ENTRA_ID_CLIENT_ID="${REACT_APP_ENTRA_ID_CLIENT_ID:-}"
  echo "REACT_APP_ENTRA_ID_CLIENT_ID: $REACT_APP_ENTRA_ID_CLIENT_ID"

  export REACT_APP_ENTRA_ID_AUTHORITY="${REACT_APP_ENTRA_ID_AUTHORITY:-}"
  echo "REACT_APP_ENTRA_ID_AUTHORITY: $REACT_APP_ENTRA_ID_AUTHORITY"

  export REACT_APP_ENTRA_ID_SCOPES="${REACT_APP_ENTRA_ID_SCOPES:-}"
  echo "REACT_APP_ENTRA_ID_SCOPES: $REACT_APP_ENTRA_ID_SCOPES"

  export REACT_APP_ENTRA_ID_KNOWN_AUTHORITIES="${REACT_APP_ENTRA_ID_KNOWN_AUTHORITIES:-}"
  echo "REACT_APP_ENTRA_ID_KNOWN_AUTHORITIES: $REACT_APP_ENTRA_ID_KNOWN_AUTHORITIES"

  export REACT_APP_ENTRA_ID_ORGANIZATION_CLAIM="${REACT_APP_ENTRA_ID_ORGANIZATION_CLAIM:-}"
  echo "REACT_APP_ENTRA_ID_ORGANIZATION_CLAIM: $REACT_APP_ENTRA_ID_ORGANIZATION_CLAIM"

  echo "Configuration for GitHub"
  export REACT_APP_GITHUB_CLIENT_ID="${REACT_APP_GITHUB_CLIENT_ID:-}"
  echo "REACT_APP_GITHUB_CLIENT_ID: $REACT_APP_GITHUB_CLIENT_ID"

  export REACT_APP_GITHUB_REDIRECT_URI="${REACT_APP_GITHUB_REDIRECT_URI:-}"
  echo "REACT_APP_GITHUB_REDIRECT_URI: $REACT_APP_GITHUB_REDIRECT_URI"

  export REACT_APP_GITHUB_SCOPES="${REACT_APP_GITHUB_SCOPES:-read:user user:email}"
  echo "REACT_APP_GITHUB_SCOPES: $REACT_APP_GITHUB_SCOPES"

  export REACT_APP_GITHUB_ORGANIZATION_CLAIM="${REACT_APP_GITHUB_ORGANIZATION_CLAIM:-organizations}"
  echo "REACT_APP_GITHUB_ORGANIZATION_CLAIM: $REACT_APP_GITHUB_ORGANIZATION_CLAIM"

  export REACT_APP_ENABLE_PUBLIC_MODULE="${REACT_APP_ENABLE_PUBLIC_MODULE:-true}"
  echo "REACT_APP_ENABLE_PUBLIC_MODULE: $REACT_APP_ENABLE_PUBLIC_MODULE"

  export REACT_APP_ENABLE_MANAGER_MODULE="${REACT_APP_ENABLE_MANAGER_MODULE:-true}"
  echo "REACT_APP_ENABLE_MANAGER_MODULE: $REACT_APP_ENABLE_MANAGER_MODULE"
  
  # Create a temporary file with replaced variables
  envsubst < "$CONFIG_FILE" > "$CONFIG_FILE.tmp"
  
  # Remove any trailing spaces that might have been introduced
  sed -i 's/[[:space:]]*$//' "$CONFIG_FILE.tmp"
  sed -i "s/': *'/': '/g" "$CONFIG_FILE.tmp"
  
  mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
  
  echo "✅ Runtime configuration updated"
}

# Replace environment variables in config file
replace_env_vars

# Set proper permissions
chown xiansai:xiansai "$CONFIG_FILE"

echo "🚀 Starting nginx..."

# Execute the original command (nginx)
exec "$@" 