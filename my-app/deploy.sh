#!/bin/bash

# Deployment script for Next.js application with Docker and Nginx

set -e

echo "🚀 Starting deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found. Make sure to set your environment variables."
fi

# Build and start the application
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.nginx.yml build

echo "🔄 Stopping existing containers..."
docker-compose -f docker-compose.nginx.yml down

echo "🚀 Starting application with Nginx..."
docker-compose -f docker-compose.nginx.yml up -d

# Wait for the application to be ready
echo "⏳ Waiting for application to be ready..."
sleep 10

# Check if the application is running
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Access your application at: http://localhost"
else
    echo "❌ Application failed to start. Check the logs:"
    docker-compose -f docker-compose.nginx.yml logs
    exit 1
fi

echo "🎉 Deployment completed successfully!"
