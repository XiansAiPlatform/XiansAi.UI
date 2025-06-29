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

The XiansAi UI supports **runtime configuration** with Docker, allowing you to use the same image across all environments by passing environment variables at runtime.

### Quick Start with Docker

```bash
# Using pre-built image with runtime configuration
docker run -d \
  --name xiansai-ui \
  -p 3000:80 \
  -e REACT_APP_API_URL=http://localhost:5000 \
  -e REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com \
  -e REACT_APP_AUTH0_CLIENT_ID=your-client-id \
  --restart unless-stopped \
  99xio/xiansai-ui:latest
```

### 📖 Complete Docker Documentation

For comprehensive Docker setup, including:
- Runtime configuration details
- Build and publish instructions  
- Production deployment strategies
- Troubleshooting and optimization
- Security features

**See: [docs/DOCKER.md](docs/DOCKER.md)**

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
```

See `.env.example` for complete configuration options.

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run analyze` | Analyze bundle size |

**Docker Scripts:** See [docs/DOCKER.md](docs/DOCKER.md) for Docker build and publish scripts.

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

### Docker Deployment (Recommended)

The recommended way to deploy XiansAi UI is using Docker with runtime configuration:

```bash
# Production deployment with environment variables
docker run -d \
  --name xiansai-ui-prod \
  -p 3000:80 \
  -e REACT_APP_API_URL=https://api.xiansai.com \
  -e REACT_APP_AUTH0_DOMAIN=your-prod-domain.auth0.com \
  -e REACT_APP_AUTH0_CLIENT_ID=your-prod-client-id \
  --restart unless-stopped \
  99xio/xiansai-ui:latest
```

For complete production setup instructions, see [docs/DOCKER.md](docs/DOCKER.md)

### Static Build Deployment

For traditional web server deployment:

```bash
# Build static files
npm run build

# Serve the build folder with your web server
# The build files will be in the 'build/' directory
```

## 🔍 Health Monitoring

The application includes a health check endpoint at `http://localhost:3000/health` for monitoring application status.

For Docker-specific health monitoring, see [docs/DOCKER.md](docs/DOCKER.md).

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






### Debugging

```bash
# Build with debug info
DEBUG=true npm run build

# Run tests with verbose output
npm test -- --verbose
```

**Docker Troubleshooting:** For Docker-specific issues, see [docs/DOCKER.md](docs/DOCKER.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
