# XiansAi UI

A modern React-based user interface for the XiansAi workflow automation platform. This application provides both manager and agent interfaces for creating, managing, and monitoring AI-powered workflows.

## 🏗️ Architecture

Built with React 19, Material-UI, React Router, Auth0/Entra ID authentication, CRACO for build optimization, and Docker for deployment.

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Docker** (for containerization)
- **Docker Hub account** (for publishing images)

## 🚀 Quick Start

### Development Setup

1. **Clone and install:**

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
   npm start                        # Default environment
   npm run start:env development    # loads .env.development
   npm run start:env staging        # loads .env.staging
   npm run start:env docker    # loads .env.project-a
   ```

### Docker Releases

```bash
# Define the version
export VERSION=1.3.7 # or 1.3.7-beta for pre-release

# Create and push a version tag
git tag -a v$VERSION -m "Release v$VERSION"
git push origin v$VERSION
```

### Production Build

```bash
npm run build                      # Default environment
npm run build:env production       # Specific environment
```

## 🐳 Docker Deployment

### Quick Start with Pre-built Image

```bash
docker run -d \
  --name xiansai-ui \
  -p 3000:80 \
  -e REACT_APP_API_URL=http://localhost:5000 \
  -e REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com \
  -e REACT_APP_AUTH0_CLIENT_ID=your-client-id \
  --restart unless-stopped \
  99xio/xiansai-ui:latest
```

### Build and Publish Your Own Image

```bash
# Set your Docker Hub credentials
export DOCKERHUB_USERNAME=your-dockerhub-username
export IMAGE_NAME=xiansai-ui
export TAG=v1.0.0

# Build and push to Docker Hub
./docker-build-publish.sh
```

### Environment-Specific Deployments

```bash
# With environment file
docker run -d \
  --name xiansai-ui-prod \
  -p 3000:80 \
  --env-file .env.production \
  99xio/xiansai-ui:latest

# Multiple environments
docker run -d --name xiansai-ui-dev -p 3001:80 --env-file .env.development 99xio/xiansai-ui:latest
docker run -d --name xiansai-ui-staging -p 3002:80 --env-file .env.staging 99xio/xiansai-ui:latest
```

**📖 Complete Docker Documentation:** [docs/DOCKER.md](docs/DOCKER.md)

## ⚙️ Configuration

### Environment Files

Support for multiple environment configurations:

```bash
.env.development      # Development (default)
.env.staging         # Staging environment  
.env.production      # Production environment
.env.local           # Local overrides (gitignored)
```

### Required Variables

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5005

# Authentication Provider ('github' ,'auth0' or 'entraId')
REACT_APP_AUTH_PROVIDER=auth0
```
### GitHub SSO Configuration

```bash
REACT_APP_GITHUB_CLIENT_ID=your-github-oauth-app-client-id
REACT_APP_GITHUB_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_GITHUB_SCOPES=read:user user:email
REACT_APP_GITHUB_ORGANIZATION_CLAIM=organizations
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
# Enable/disable modules
REACT_APP_ENABLE_PUBLIC_MODULE=true
REACT_APP_ENABLE_MANAGER_MODULE=true
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Development server (default environment) |
| `npm run start:env <env>` | Development server with specific environment |
| `npm run build` | Production build (default environment) |
| `npm run build:env <env>` | Production build with specific environment |
| `npm test` | Run tests |
| `npm run analyze` | Analyze bundle size |

## 📁 Project Structure

```
src/
├── components/          # Shared components
├── modules/
│   ├── Manager/        # Management interface
│   └── Public/         # Public pages
├── routes/             # Routing configuration
├── utils/              # Utility functions
└── config.js           # Runtime configuration
```

## 🛠️ Development

### Key Features

- **Lazy Loading:** Modules are lazy-loaded for performance
- **Code Splitting:** Optimized bundle splitting
- **Error Boundaries:** Comprehensive error handling
- **Authentication:** Pluggable auth providers (Auth0/Entra ID)
- **Environment Management:** Dynamic configuration loading

### Build Optimization

- Tree shaking for unused code elimination
- Code splitting by vendor and feature
- Compression with gzip
- Bundle analysis with webpack-bundle-analyzer

### Testing

```bash
npm test                 # Run tests
npm test -- --coverage  # Run with coverage
```

## 🔐 Security & Performance

- **Security:** CSP headers, XSS protection, HTTPS ready, non-root container
- **Performance:** Lighthouse optimized, bundle size optimization, aggressive caching
- **Health Monitoring:** Health check endpoint at `/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see the LICENSE file for details.
