#!/bin/bash

# Complete Server Deployment Script
# Run this on your server after uploading your project

set -e

echo "🚀 Starting server deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user with sudo privileges."
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_warning "Docker installed. You may need to log out and back in for group changes to take effect."
else
    print_status "Docker is already installed."
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose is already installed."
fi

# Create application directory
APP_DIR="/opt/my-app"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy project files (assuming you're in the project directory)
print_status "Copying project files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Set up environment variables
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp env.example .env
    print_warning "Please edit .env file with your actual values before continuing."
    echo "Press Enter when ready to continue..."
    read
fi

# Make deployment script executable
chmod +x deploy-final.sh

# Build and start the application
print_status "Building Docker images..."
docker-compose -f docker-compose.nginx.yml build

print_status "Starting application..."
docker-compose -f docker-compose.nginx.yml up -d

# Wait for application to be ready
print_status "Waiting for application to be ready..."
sleep 20

# Check if application is running
print_status "Checking application status..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_status "✅ Application is running successfully!"
    print_status "🌐 Access your application at: http://$(curl -s ifconfig.me)"
    print_status "📊 Application logs:"
    docker-compose -f docker-compose.nginx.yml logs app --tail=10
else
    print_error "❌ Application failed to start. Check the logs:"
    docker-compose -f docker-compose.nginx.yml logs
    exit 1
fi

# Set up firewall (optional)
print_status "Setting up firewall..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable

# Create systemd service for auto-start (optional)
print_status "Creating systemd service for auto-start..."
sudo tee /etc/systemd/system/my-app.service > /dev/null <<EOF
[Unit]
Description=My App Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.nginx.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.nginx.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable my-app.service
print_status "Systemd service created and enabled."

print_status "🎉 Deployment completed successfully!"
echo ""
print_status "📋 Useful commands:"
echo "  View logs: docker-compose -f docker-compose.nginx.yml logs -f"
echo "  Stop app: docker-compose -f docker-compose.nginx.yml down"
echo "  Restart: sudo systemctl restart my-app"
echo "  Update: git pull && docker-compose -f docker-compose.nginx.yml up -d --build"
echo ""
print_status "🔧 Next steps:"
echo "  1. Configure your domain in nginx.conf"
echo "  2. Set up SSL certificates"
echo "  3. Configure your database connection"
echo "  4. Set up monitoring and backups"
