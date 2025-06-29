# Docker Deployment Guide

This document provides comprehensive information about containerizing and deploying the XiansAi UI using Docker.

## 🚨 Quick Fix Reference

If you encounter build issues, here are the most common fixes:

1. **Node.js 20+ Required**: Update Dockerfile to use `node:20-alpine`
2. **Package Lock Sync**: Run `npm install` to fix lock file issues
3. **Nginx Config**: Remove `must-revalidate` from gzip_proxied
4. **Permissions**: Use `/tmp/nginx.pid` for non-root nginx

## 🏗️ Docker Architecture

### Multi-Stage Build Strategy

The XiansAi UI uses a **multi-stage Docker build** for optimal production images:

1. **Build Stage** (`node:20-alpine`):
   - Installs dependencies and builds the React application
   - Includes build tools and development dependencies
   - Outputs optimized static files

2. **Production Stage** (`nginx:1.25-alpine`):
   - Serves static files using nginx
   - Minimal footprint with only runtime requirements
   - Includes security hardening and performance optimizations

### Image Features

- ✅ **Multi-platform support** (AMD64 and ARM64)
- ✅ **Security hardening** (non-root user, minimal attack surface)
- ✅ **Performance optimization** (gzip compression, caching)
- ✅ **Health monitoring** (built-in health checks)
- ✅ **Production-ready** (nginx configuration, security headers)

## 📁 Docker Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Development containerization with hot reloading |
| `Dockerfile.production` | Production-optimized build with runtime configuration support |
| `docker-entrypoint.sh` | Runtime configuration injection script |
| `public/config.js` | Runtime configuration template |
| `nginx.conf` | Custom nginx configuration for React SPA |
| `docker-build.sh` | Automated build script with multi-platform support |
| `docker-publish.sh` | Automated publishing to Docker Hub |
| `.dockerignore` | Excludes unnecessary files from build context |
| `.env.runtime.example` | Example runtime environment configuration |

## 🚀 Quick Start

### Option 1: Use Pre-built Images with Runtime Configuration

```bash
# Pull and run with your environment variables
docker run -d \
  --name xiansai-ui \
  -p 3000:80 \
  -e REACT_APP_API_URL=http://localhost:5000 \
  -e REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com \
  -e REACT_APP_AUTH0_CLIENT_ID=your-client-id \
  -e REACT_APP_AUTH0_AUDIENCE=https://your-api-audience \
  --restart unless-stopped \
  99xio/xiansai-ui:latest
```

### Option 2: Build and Run Locally

```bash
# Build using the production Dockerfile
docker build -f Dockerfile.production -t xiansai-ui .

# Run with your configuration
docker run -d \
  --name xiansai-ui \
  -p 3000:80 \
  --env-file .env.runtime \
  xiansai-ui
```

## 🛠️ Development

For development work, use the runtime configuration approach with development environment variables.

### Local Development (Recommended)

For the fastest development experience:

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Docker Development with Runtime Configuration

Use the production image with development environment variables:

```bash
# Build production image
docker build -f Dockerfile.production -t xiansai-ui .

# Run with development configuration
docker run -d \
  --name xiansai-ui-dev \
  -p 3000:80 \
  -e REACT_APP_API_URL=http://localhost:5000 \
  -e REACT_APP_AUTH0_DOMAIN=xiansai-dev.eu.auth0.com \
  -e REACT_APP_AUTH0_CLIENT_ID=your-dev-client-id \
  -e REACT_APP_AUTH0_AUDIENCE=https://dev-api.xiansai.com \
  xiansai-ui
```

### Development Environment Variables

Example development configuration:

```bash
REACT_APP_AUTH_PROVIDER=auth0
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AUTH0_DOMAIN=xiansai-dev.eu.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-dev-client-id
REACT_APP_AUTH0_AUDIENCE=https://dev-api.xiansai.com
```

## 🔄 Runtime Configuration

The XiansAi UI supports **runtime configuration** - you can change environment variables when running containers **without rebuilding the image**. This solves the React build-time limitation!

### ✨ How It Works

Pass environment variables at container runtime:

```bash
# Build the image once (no environment variables needed at build time)
docker build -f Dockerfile.production -t xiansai-ui .

# Run with development configuration - NO REBUILD NEEDED!
docker run -d \
  --name xiansai-ui-dev \
  -p 3000:80 \
  -e REACT_APP_API_URL=http://localhost:5000 \
  -e REACT_APP_AUTH0_DOMAIN=xiansai-dev.eu.auth0.com \
  -e REACT_APP_AUTH0_CLIENT_ID=your-dev-client-id \
  -e REACT_APP_AUTH0_AUDIENCE=https://dev-api.xiansai.com \
  xiansai-ui

# Run with production configuration - SAME IMAGE!
docker run -d \
  --name xiansai-ui-prod \
  -p 3000:80 \
  -e REACT_APP_API_URL=https://api.xiansai.com \
  -e REACT_APP_AUTH0_DOMAIN=xiansai-prod.eu.auth0.com \
  -e REACT_APP_AUTH0_CLIENT_ID=your-prod-client-id \
  -e REACT_APP_AUTH0_AUDIENCE=https://api.xiansai.com \
  xiansai-ui
```

### Environment File Support

```bash
# Create your runtime environment file
cat > .env.runtime << EOF
REACT_APP_AUTH_PROVIDER=auth0
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AUTH0_DOMAIN=xiansai-prod.eu.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://xians.ai/api
EOF

# Run with environment file
docker run -d \
  --name xiansai-ui \
  -p 3000:80 \
  --env-file .env.development \
  xiansai-ui
```

### 🎯 Key Benefits

✅ **No Rebuild Required**: Change config without rebuilding the image  
✅ **One Image, Multiple Environments**: Use same image for dev/staging/prod  
✅ **True Runtime Variables**: Variables are injected when container starts  
✅ **Environment File Support**: Use `.env` files with Docker  
✅ **CI/CD Friendly**: Build once, deploy everywhere  

### 🔧 How Runtime Configuration Works

1. **Build Time**: A template `config.js` is created with placeholders like `${REACT_APP_API_URL}`
2. **Container Startup**: The `docker-entrypoint.sh` script runs and:
   - Reads environment variables from the container
   - Replaces placeholders in `config.js` with actual values
   - Makes the updated config available to the React app
3. **Runtime**: The React app reads from `window.RUNTIME_CONFIG` with fallback to build-time variables

**Example:**

```javascript
// Template at build time (public/config.js)
window.RUNTIME_CONFIG = {
  REACT_APP_API_URL: '${REACT_APP_API_URL}'
}

// After container startup with -e REACT_APP_API_URL=http://localhost:5000
window.RUNTIME_CONFIG = {
  REACT_APP_API_URL: 'http://localhost:5000'
}

// React app (src/config.js) reads the runtime value
function getEnvVar(key) {
  if (window.RUNTIME_CONFIG && window.RUNTIME_CONFIG[key]) {
    return window.RUNTIME_CONFIG[key]; // Runtime value
  }
  return process.env[key]; // Build-time fallback
}
```

## 🔧 Build Scripts

### docker-build.sh

Automated build script with the following features:

```bash
# Basic usage
export TAG=latest
export IMAGE_NAME=99xio/xiansai-ui
./docker-build.sh

# Custom configuration (Change this to your own username)
IMAGE_NAME=99xio/xiansai-ui \
TAG=v1.0.0 \
PLATFORM=linux/amd64,linux/arm64 \
./docker-build.sh
```

**Environment Variables:**

- `IMAGE_NAME`: Docker image name (default: `xiansai/ui`)
- `TAG`: Image tag (default: `latest`)
- `DOCKERFILE`: Dockerfile to use (default: `Dockerfile.production`)
- `PLATFORM`: Target platforms (default: `linux/amd64,linux/arm64`)

### docker-publish.sh

Automated publishing script for Docker Hub:

```bash
# Set your Docker Hub username (Change this to your own username)
export DOCKERHUB_USERNAME=99xio

# Basic publish
export ADDITIONAL_TAGS="v1.0.0,latest"
./docker-publish.sh

```

**Environment Variables:**

- `DOCKERHUB_USERNAME`: Your Docker Hub username (required)
- `IMAGE_NAME`: Local image name (default: `xiansai/ui`)
- `TAG`: Main tag to publish (default: `latest`)
- `ADDITIONAL_TAGS`: Comma-separated additional tags

## 🏭 Production Deployment

### Docker with Runtime Configuration

Deploy the UI with production environment variables:

```bash
# Pull and run the latest production image
docker run -d \
  --name xiansai-ui-prod \
  -p 3000:80 \
  -e REACT_APP_API_URL=https://api.xiansai.com \
  -e REACT_APP_AUTH0_DOMAIN=xiansai-prod.eu.auth0.com \
  -e REACT_APP_AUTH0_CLIENT_ID=your-prod-client-id \
  -e REACT_APP_AUTH0_AUDIENCE=https://api.xiansai.com \
  --restart unless-stopped \
  99xio/xiansai-ui:latest

# Or use an environment file
docker run -d \
  --name xiansai-ui-prod \
  -p 3000:80 \
  --env-file .env.production \
  --restart unless-stopped \
  99xio/xiansai-ui:latest
```

### Kubernetes Deployment

For Kubernetes deployment, here's a sample configuration:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: xiansai-ui
spec:
  replicas: 3
  selector:
    matchLabels:
      app: xiansai-ui
  template:
    metadata:
      labels:
        app: xiansai-ui
    spec:
      containers:
      - name: xiansai-ui
        image: xiansai/ui:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: xiansai-ui-service
spec:
  selector:
    app: xiansai-ui
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## ⚙️ Configuration

### Environment Variables

The Docker image supports runtime configuration through environment variables:

```bash
# Core configuration
NODE_ENV=production
NGINX_PORT=80

# Application configuration (build-time)
REACT_APP_API_URL=https://api.xiansai.com
REACT_APP_AUTH_PROVIDER=auth0
```

### Build Arguments

For custom builds, you can use build arguments:

```bash
docker build \
  --build-arg BUILDPLATFORM=linux/amd64 \
  --build-arg TARGETARCH=amd64 \
  -f Dockerfile.production \
  -t xiansai-ui:custom .
```

## 🔍 Monitoring and Health Checks

### Built-in Health Check

The Docker image includes a health check endpoint:

```bash
# Manual health check
curl http://localhost:3000/health

# Docker health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Monitoring Integration

The nginx configuration includes structured logging for monitoring tools:

```nginx
# Access log format includes:
- Remote IP
- Request details
- Response status
- Response time
- User agent
- Forwarded headers
```

## 🔐 Security Features

### Container Security

- **Non-root user**: Runs as user `xiansai` (UID 1001)
- **Minimal base image**: Uses Alpine Linux for smaller attack surface
- **Read-only filesystem**: Static files served from read-only location
- **No shell access**: Production image doesn't include shell utilities

### Web Security Headers

The nginx configuration includes security headers:

```nginx
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer-when-downgrade
Content-Security-Policy: default-src 'self' http: https: data: blob: 'unsafe-inline'
```

### Network Security

```bash
# Run with custom network
docker network create xiansai-network
docker run -d \
  --name xiansai-ui \
  --network xiansai-network \
  -p 3000:80 \
  xiansai/ui:latest
```

## 📊 Performance Optimization

### Build Optimizations

- **Multi-stage build**: Reduces final image size by ~70%
- **Layer caching**: Optimized layer order for better caching
- **Dependency optimization**: Separate dependency and source layers

### Runtime Optimizations

- **Gzip compression**: Automatic compression for text assets
- **Static asset caching**: Long-term caching for versioned assets
- **HTTP/2 ready**: nginx configured for HTTP/2 support

### Image Size Comparison

| Image Type | Size | Notes |
|------------|------|-------|
| Development | ~800MB | Includes Node.js, build tools |
| Production | ~25MB | nginx + static files only |
| Multi-arch | ~50MB | Combined AMD64 + ARM64 |

### Debug Mode

For debugging, you can run the container interactively:

```bash
# Override entrypoint for debugging
docker run -it --entrypoint /bin/sh xiansai/ui:latest

# Run with debug nginx configuration
docker run -d \
  --name xiansai-ui-debug \
  -p 3000:80 \
  -e NGINX_DEBUG=1 \
  xiansai/ui:latest
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    tags: ['v*']
    branches: ['main']

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
    
    - name: Build and push
      run: |
        export DOCKERHUB_USERNAME=${{ secrets.DOCKERHUB_USERNAME }}
        ./docker-build.sh
```

### GitLab CI Example

```yaml
docker-build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $DOCKERHUB_USERNAME -p $DOCKERHUB_TOKEN
  script:
    - ./docker-build.sh
  only:
    - main
    - tags
```

## ✅ Verified Working Example

The following configuration has been tested and verified to work:

### Successful Build Example

```bash
# Multi-platform build that works
IMAGE_NAME=99xio/xiansai-ui \
TAG=v1.0.0 \
PLATFORM=linux/amd64,linux/arm64 \
./docker-build.sh
```

### Published Image

- **Registry**: Docker Hub
- **Image**: `99xio/xiansai-ui:v1.0.0`
- **Platforms**: `linux/amd64`, `linux/arm64`
- **Status**: ✅ Working and tested
- **Health Check**: ✅ `/health` endpoint responding

### Test Commands

```bash
# Test the published image
docker run -d --name test-ui -p 3000:80 99xio/xiansai-ui:v1.0.0

# Verify health check
curl http://localhost:3000/health
# Expected: "healthy"

# Verify React app
curl -s http://localhost:3000/ | grep -o '<title>[^<]*'
# Expected: "<title>Xians.ai"

# Cleanup
docker stop test-ui && docker rm test-ui
```

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/#use-multi-stage-builds)
- [Docker Security](https://docs.docker.com/engine/security/)
- [nginx Configuration](https://nginx.org/en/docs/)

## 📋 Quick Reference

### Development Commands

```bash
# Local Development (Recommended)
npm install && npm start

# Docker with Runtime Configuration
docker build -f Dockerfile.production -t xiansai-ui .
docker run -p 3000:80 -e REACT_APP_API_URL=http://localhost:5000 xiansai-ui

# With Environment File
docker run -p 3000:80 --env-file .env.runtime xiansai-ui
```

### Production Commands  

```bash
# Pre-built Image with Runtime Config
docker run -d -p 3000:80 \
  -e REACT_APP_API_URL=https://api.xiansai.com \
  -e REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com \
  99xio/xiansai-ui:latest

# Build and Run Locally
docker build -f Dockerfile.production -t xiansai-ui .
docker run -p 3000:80 --env-file .env.production xiansai-ui
```

### Build and Publish

```bash
# Build Multi-platform
IMAGE_NAME=99xio/xiansai-ui TAG=latest ./docker-build.sh

# Publish to Docker Hub  
DOCKERHUB_USERNAME=99xio ./docker-publish.sh
```
