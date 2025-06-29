# XiansAi UI

A modern React-based user interface for the XiansAi workflow automation platform. This application provides both manager and agent interfaces for creating, managing, and monitoring AI-powered workflows.

## 🏗️ Architecture

The XiansAi UI is built with:
- **React 19** with functional components and hooks
- **Material-UI (MUI)** for consistent design system
- **React Router** for client-side routing
- **Auth0 & Entra ID** for authentication
- **CRACO** for build customization and optimization
- **Docker** for containerization and deployment

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Buildx (for containerization)
- **Docker Hub account** (for publishing images)

## 🚀 Quick Start

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd XiansAi.UI
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
```

## 🐳 Docker Deployment

### Option 1: Use Pre-built Images (Recommended)

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Run with docker-compose
docker-compose -f docker-compose.production.yml up -d
```

### Option 2: Build and Publish Your Own Images

1. **Build the Docker image:**
   ```bash
   # Build for multiple platforms
   ./docker-build.sh
   
   # Or with custom settings
   IMAGE_NAME=myorg/xiansai-ui TAG=v1.0.0 ./docker-build.sh
   ```

2. **Publish to Docker Hub:**
   ```bash
   # Set your Docker Hub username
   export DOCKERHUB_USERNAME=yourusername
   
   # Publish the image
   ./docker-publish.sh
   
   # Or with additional tags
   ADDITIONAL_TAGS=v1.0.0,stable ./docker-publish.sh
   ```

3. **Update your environment:**
   ```bash
   # Update .env file
   DOCKER_UI_IMAGE=yourusername/xiansai-ui:latest
   ```

### Docker Configuration

The Docker setup includes:
- **Multi-stage build** for optimized production images
- **Multi-platform support** (AMD64 and ARM64)
- **Nginx** for serving static files with optimized configuration
- **Security features** (non-root user, security headers)
- **Health checks** for container monitoring
- **Gzip compression** for better performance

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Authentication Provider ('auth0' or 'entraId')
REACT_APP_AUTH_PROVIDER=auth0
```

### Auth0 Configuration
```bash
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://your-api-audience
```

### Entra ID Configuration
```bash
REACT_APP_ENTRA_ID_CLIENT_ID=your-client-id
REACT_APP_ENTRA_ID_AUTHORITY=https://login.microsoftonline.com/tenant-id
REACT_APP_ENTRA_ID_SCOPES=User.Read,openid,profile
```

### Module Configuration
```bash
# Enable/disable modules (set to 'false' to disable)
REACT_APP_ENABLE_PUBLIC_MODULE=true
REACT_APP_ENABLE_MANAGER_MODULE=true
REACT_APP_ENABLE_AGENTS_MODULE=true
```

See `.env.example` for complete configuration options.

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run analyze` | Analyze bundle size |
| `./docker-build.sh` | Build Docker image |
| `./docker-publish.sh` | Publish to Docker Hub |

## 📁 Project Structure

```
src/
├── components/          # Shared components
├── modules/
│   ├── Agents/         # Agent interface module
│   ├── Manager/        # Management interface module
│   └── Public/         # Public pages module
├── routes/             # Routing configuration
├── utils/              # Utility functions
└── config.js           # Runtime configuration
```

## 🏭 Production Deployment

### Using Docker Compose (Recommended)

1. **Prepare environment:**
   ```bash
   cp .env.example .env
   # Configure your .env file
   ```

2. **Deploy both UI and Server:**
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

3. **Monitor services:**
   ```bash
   docker-compose -f docker-compose.production.yml logs -f
   ```

### Manual Docker Deployment

```bash
# Run the UI container
docker run -d \
  --name xiansai-ui \
  -p 3000:80 \
  --restart unless-stopped \
  xiansai/ui:latest
```

## 🔍 Health Monitoring

The application includes health check endpoints:
- **UI Health Check:** `http://localhost:3000/health`
- **Docker Health Check:** Automatic container health monitoring

## 🛠️ Development

### Code Organization

- **Lazy Loading:** Modules are lazy-loaded for better performance
- **Code Splitting:** Optimized bundle splitting with CRACO
- **Error Boundaries:** Comprehensive error handling
- **Authentication:** Pluggable auth providers (Auth0/Entra ID)

### Build Optimization

The build process includes:
- **Tree shaking** for unused code elimination
- **Code splitting** by vendor and feature
- **Compression** with gzip
- **Bundle analysis** with webpack-bundle-analyzer

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🔐 Security Features

- **CSP Headers:** Content Security Policy implementation
- **XSS Protection:** Cross-site scripting prevention
- **HTTPS Ready:** SSL/TLS configuration support
- **Non-root Container:** Docker security best practices
- **Dependency Scanning:** Regular security updates

## 📊 Performance

- **Lighthouse Score:** Optimized for performance metrics
- **Bundle Size:** Optimized with code splitting
- **Caching:** Aggressive caching for static assets
- **Compression:** Gzip compression enabled

## 🐛 Troubleshooting

### Common Issues

1. **Build fails with memory issues:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

2. **Docker build fails:**
   ```bash
   # Check Docker Buildx
   docker buildx version
   
   # Recreate builder
   docker buildx rm xiansai-ui-builder
   ./docker-build.sh
   ```

3. **Authentication not working:**
   - Verify environment variables are set correctly
   - Check Auth0/Entra ID configuration
   - Ensure API URLs are accessible

### Logs and Debugging

```bash
# Docker container logs
docker logs xiansai-ui

# Docker compose logs
docker-compose -f docker-compose.production.yml logs xiansai-ui

# Build with debug info
DEBUG=true npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Projects

- **XiansAi Server:** Backend API and workflow engine
- **XiansAi Agents:** AI agent implementations

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the troubleshooting section above

