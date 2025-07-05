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
  export REACT_APP_AUTH_PROVIDER="${REACT_APP_AUTH_PROVIDER:-auth0}"
  export REACT_APP_API_URL="${REACT_APP_API_URL:-}"

  export REACT_APP_KEYCLOAK_URL="${REACT_APP_KEYCLOAK_URL:-}"
  export REACT_APP_KEYCLOAK_REALM="${REACT_APP_KEYCLOAK_REALM:-}"
  export REACT_APP_KEYCLOAK_CLIENT_ID="${REACT_APP_KEYCLOAK_CLIENT_ID:-}"
  
  export REACT_APP_AUTH0_DOMAIN="${REACT_APP_AUTH0_DOMAIN:-}"
  export REACT_APP_AUTH0_CLIENT_ID="${REACT_APP_AUTH0_CLIENT_ID:-}"
  export REACT_APP_AUTH0_AUDIENCE="${REACT_APP_AUTH0_AUDIENCE:-}"

  export REACT_APP_ENTRA_ID_CLIENT_ID="${REACT_APP_ENTRA_ID_CLIENT_ID:-}"
  export REACT_APP_ENTRA_ID_AUTHORITY="${REACT_APP_ENTRA_ID_AUTHORITY:-}"
  export REACT_APP_ENTRA_ID_SCOPES="${REACT_APP_ENTRA_ID_SCOPES:-}"
  export REACT_APP_ENTRA_ID_KNOWN_AUTHORITIES="${REACT_APP_ENTRA_ID_KNOWN_AUTHORITIES:-}"
  export REACT_APP_ENTRA_ID_ORGANIZATION_CLAIM="${REACT_APP_ENTRA_ID_ORGANIZATION_CLAIM:-}"

  export REACT_APP_ENABLE_PUBLIC_MODULE="${REACT_APP_ENABLE_PUBLIC_MODULE:-true}"
  export REACT_APP_ENABLE_MANAGER_MODULE="${REACT_APP_ENABLE_MANAGER_MODULE:-true}"
  
  # Create a temporary file with replaced variables
  envsubst < "$CONFIG_FILE" > "$CONFIG_FILE.tmp"
  
  # Remove any trailing spaces that might have been introduced
  sed -i 's/[[:space:]]*$//' "$CONFIG_FILE.tmp"
  sed -i "s/': *'/': '/g" "$CONFIG_FILE.tmp"
  
  mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
  
  echo "✅ Runtime configuration updated"
  
  # Debug: show configuration (remove sensitive values)
  echo "🔍 Current configuration:"
  echo "  AUTH_PROVIDER: $REACT_APP_AUTH_PROVIDER"
  echo "  API_URL: $REACT_APP_API_URL"
  echo "  PUBLIC_MODULE: $REACT_APP_ENABLE_PUBLIC_MODULE"
  echo "  MANAGER_MODULE: $REACT_APP_ENABLE_MANAGER_MODULE"
}

# Replace environment variables in config file
replace_env_vars

# Set proper permissions
chown xiansai:xiansai "$CONFIG_FILE"

echo "🚀 Starting nginx..."

# Execute the original command (nginx)
exec "$@" 