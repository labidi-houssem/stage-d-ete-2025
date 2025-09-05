#!/bin/bash

# Server setup script - Run this ONCE on your server
# Usage: ssh houssem@104.248.134.98 'bash -s' < setup-server.sh

set -e

echo "🔧 Setting up server for Next.js application deployment..."

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
else
    echo "✅ Docker is already installed"
fi

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose is already installed"
fi

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/houssem/my-app
cd /home/houssem/my-app

# Create SSL directory for future HTTPS setup
mkdir -p ssl

# Create uploads directory
mkdir -p public/uploads

# Set proper permissions
chown -R houssem:houssem /home/houssem/my-app

echo "✅ Server setup completed!"
echo "📝 Next steps:"
echo "   1. Create .env file with your production environment variables"
echo "   2. Run ./deploy-to-server.sh from your local machine"
echo "   3. Your application will be available at http://104.248.134.98"
