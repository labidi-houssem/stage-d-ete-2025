# 🚀 Production Deployment Guide

This guide will help you deploy your Next.js application to your server with automatic deployment on every commit.

## 📋 Prerequisites

- Server: `houssem@104.248.134.98`
- Local machine with Docker installed
- SSH access to your server
- Git repository set up

## 🔧 Initial Server Setup (Run Once)

1. **Set up the server environment:**
   ```bash
   ssh houssem@104.248.134.98 'bash -s' < setup-server.sh
   ```

2. **Create production environment file on server:**
   ```bash
   ssh houssem@104.248.134.98
   cd /home/houssem/my-app
   cp env.example .env
   nano .env  # Edit with your production values
   ```

## 🌍 Environment Variables

Update your `.env` file with production values:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/myapp"

# NextAuth Configuration
NEXTAUTH_URL="http://104.248.134.98"
NEXTAUTH_SECRET="your-production-secret-key"

# Google OAuth (if using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration (if using)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

## 🚀 Deployment Methods

### Method 1: Manual Deployment
```bash
./deploy-to-server.sh
```

### Method 2: Automatic Deployment (Recommended)
Every time you commit to the main/master branch, the application will automatically deploy:

```bash
git add .
git commit -m "Your changes"
# Deployment happens automatically!
```

## 📁 Project Structure

```
my-app/
├── docker-compose.prod.yml    # Production Docker Compose
├── Dockerfile.prod            # Production Dockerfile
├── nginx.prod.conf            # Production Nginx config
├── deploy-to-server.sh        # Deployment script
├── setup-server.sh            # Server setup script
└── .git/hooks/post-commit     # Auto-deployment hook
```

## 🔍 Monitoring

- **Health Check:** http://104.248.134.98/health
- **Application:** http://104.248.134.98
- **Logs:** `ssh houssem@104.248.134.98 "cd /home/houssem/my-app && docker-compose -f docker-compose.prod.yml logs"`

## 🛠️ Troubleshooting

### Application won't start
```bash
ssh houssem@104.248.134.98
cd /home/houssem/my-app
docker-compose -f docker-compose.prod.yml logs
```

### Rebuild application
```bash
ssh houssem@104.248.134.98
cd /home/houssem/my-app
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Check Docker status
```bash
ssh houssem@104.248.134.98
docker ps
docker images
```

## 🔒 Security Features

- Rate limiting on API endpoints
- Security headers
- Gzip compression
- Static file caching
- Health check endpoint
- Non-root user in containers

## 📈 Performance Optimizations

- Multi-stage Docker build
- Nginx reverse proxy
- Static file caching
- Gzip compression
- Optimized Next.js build

## 🔄 Update Process

1. Make changes to your code
2. Commit to main/master branch
3. Deployment happens automatically
4. Check health endpoint to verify deployment

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment variables
3. Check server resources
4. Ensure Docker is running
