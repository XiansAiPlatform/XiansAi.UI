#!/bin/bash
set -e

# Configuration
DEFAULT_IMAGE_NAME="xiansai/ui"
IMAGE_NAME="${IMAGE_NAME:-$DEFAULT_IMAGE_NAME}"
TAG="${TAG:-latest}"
DOCKERFILE="${DOCKERFILE:-Dockerfile.production}"
PLATFORM="${PLATFORM:-linux/amd64,linux/arm64}"

echo "🏗️  Building Docker image for XiansAi UI..."
echo "Image: $IMAGE_NAME:$TAG"
echo "Dockerfile: $DOCKERFILE"
echo "Platform: $PLATFORM"

# Check if buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo "❌ Docker buildx is required for multi-platform builds"
    echo "Please install Docker Desktop or enable buildx"
    exit 1
fi

# Create buildx builder if it doesn't exist
if ! docker buildx inspect xiansai-ui-builder > /dev/null 2>&1; then
    echo "🔧 Creating buildx builder..."
    docker buildx create --name xiansai-ui-builder --use
fi

# Build multi-platform image
echo "🚀 Building multi-platform image..."
docker buildx build \
    --platform "$PLATFORM" \
    --file "$DOCKERFILE" \
    --tag "$IMAGE_NAME:$TAG" \
    --push \
    .

# Also build and load locally for current platform (needed for docker-publish.sh)
if [[ "$PLATFORM" == *","* ]]; then
    echo "🏗️  Building local image for current platform..."
    CURRENT_PLATFORM=$(docker version --format '{{.Server.Os}}/{{.Server.Arch}}')
    docker buildx build \
        --platform "$CURRENT_PLATFORM" \
        --file "$DOCKERFILE" \
        --tag "$IMAGE_NAME:$TAG" \
        --load \
        .
fi

echo "✅ Docker image built and pushed successfully!"
echo "📦 Image: $IMAGE_NAME:$TAG"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the image locally: docker run -p 3000:80 $IMAGE_NAME:$TAG"
echo "   2. Update your .env file with your configuration"
echo "   3. Run: docker-compose -f docker-compose.production.yml up -d" 