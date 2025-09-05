#!/bin/bash

# Production deployment script for Next.js application (without local Docker)
# Usage: ./deploy-to-server-no-docker.sh

set -e

# Configuration
SERVER_USER="houssem"
SERVER_HOST="104.248.134.98"
SERVER_PATH="/home/houssem/my-app"
APP_NAME="my-app"

echo "🚀 Starting production deployment to server..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on env.example"
    exit 1
fi

# Load environment variables
echo "📄 Loading environment variables..."
export $(cat .env | grep -v '^#' | xargs)

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf deployment.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=deployment.tar.gz \
    --exclude=.env.local \
    --exclude=.env.development \
    --exclude=env.prod \
    .

echo "📤 Uploading files to server..."
scp deployment.tar.gz ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

echo "🔧 Setting up application on server..."
ssh ${SERVER_USER}@${SERVER_HOST} << EOF
    set -e
    
    echo "📁 Extracting files..."
    cd ${SERVER_PATH}
    tar -xzf deployment.tar.gz
    rm deployment.tar.gz
    
    echo "🐳 Building and starting application..."
    docker-compose -f docker-compose.prod.yml down || true
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "⏳ Waiting for application to be ready..."
    sleep 20
    
    echo "🔍 Checking application health..."
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "✅ Application is running successfully!"
        echo "🌐 Access your application at: http://${SERVER_HOST}"
    else
        echo "❌ Application failed to start. Checking logs..."
        docker-compose -f docker-compose.prod.yml logs
        exit 1
    fi
    
    echo "🧹 Cleaning up old images..."
    docker image prune -f
    
    echo "🎉 Deployment completed successfully!"
EOF

# Clean up local deployment package
rm deployment.tar.gz

echo "✅ Deployment completed! Your application is now running at http://${SERVER_HOST}"
