# 🚀 Complete Docker & Nginx Deployment Setup

Your Next.js application is now ready for deployment with Docker and Nginx!

## ✅ What's Been Set Up

### 1. **Docker Configuration**
- ✅ `Dockerfile.simple` - Working Docker image (development mode)
- ✅ `docker-compose.nginx.yml` - Production setup with Nginx
- ✅ `docker-compose.yml` - Development setup with database
- ✅ `docker-compose.prod.yml` - Production setup without database

### 2. **Nginx Configuration**
- ✅ `nginx.conf` - Reverse proxy with security headers
- ✅ Gzip compression enabled
- ✅ Static file caching
- ✅ Health check endpoint

### 3. **Deployment Scripts**
- ✅ `deploy-final.sh` - Complete deployment script
- ✅ `deploy.sh` - Alternative deployment script

### 4. **Environment Configuration**
- ✅ `env.example` - Template for environment variables
- ✅ `.dockerignore` - Optimized Docker build context

## 🚀 Quick Start Deployment

### Option 1: Using the Deployment Script (Recommended)

```bash
# Make the script executable
chmod +x deploy-final.sh

# Run the deployment
./deploy-final.sh
```

### Option 2: Manual Deployment

```bash
# 1. Set up environment variables
cp env.example .env
# Edit .env with your actual values

# 2. Build and start
docker-compose -f docker-compose.nginx.yml up -d --build

# 3. Check status
docker-compose -f docker-compose.nginx.yml ps
```

## 🌐 Access Your Application

- **Local Development**: http://localhost:3000
- **Production (with Nginx)**: http://localhost (port 80)

## 📋 Available Commands

### Development
```bash
# Start with database
docker-compose up -d

# Start with Nginx
docker-compose -f docker-compose.nginx.yml up -d

# View logs
docker-compose -f docker-compose.nginx.yml logs -f

# Stop all services
docker-compose -f docker-compose.nginx.yml down
```

### Production
```bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Update application
git pull
docker-compose -f docker-compose.nginx.yml up -d --build
```

## 🔧 Configuration Files

### Environment Variables (.env)
```bash
# Required
DATABASE_URL="postgresql://username:password@host:5432/database"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Optional
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### Nginx Configuration
- Reverse proxy to Next.js app
- Security headers
- Gzip compression
- Static file caching
- Health check endpoint

## 🐳 Docker Images

### Working Images
- `my-app-app:latest` - Main application
- `nginx:alpine` - Reverse proxy

### Build Commands
```bash
# Build simple version (recommended)
docker build -f Dockerfile.simple -t my-app-simple .

# Build production version (experimental)
docker build -f Dockerfile.final -t my-app-final .
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 80
   netstat -tulpn | grep :80
   # Or change ports in docker-compose.nginx.yml
   ```

2. **Database connection failed**
   ```bash
   # Check DATABASE_URL in .env
   # Test connection
   docker-compose exec app npx prisma db push
   ```

3. **Build fails**
   ```bash
   # Use the simple Dockerfile
   docker build -f Dockerfile.simple -t my-app .
   ```

4. **Permission issues**
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   # Or run with sudo
   sudo docker-compose -f docker-compose.nginx.yml up -d
   ```

### Health Checks
```bash
# Check if app is running
curl http://localhost/health

# Check container status
docker-compose -f docker-compose.nginx.yml ps

# View logs
docker-compose -f docker-compose.nginx.yml logs app
```

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose -f docker-compose.nginx.yml logs -f

# Specific service
docker-compose -f docker-compose.nginx.yml logs app -f
docker-compose -f docker-compose.nginx.yml logs nginx -f
```

### Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.nginx.yml up -d --build
```

### Backup Database
```bash
# Create backup
docker-compose exec db pg_dump -U postgres myapp > backup.sql

# Restore backup
docker-compose exec -T db psql -U postgres myapp < backup.sql
```

### Clean Up
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove everything (WARNING: deletes data)
docker-compose -f docker-compose.nginx.yml down -v
docker system prune -a
```

## 🚀 Production Deployment

### Server Requirements
- Docker & Docker Compose installed
- Port 80 (and 443 for SSL) available
- PostgreSQL database (external or local)

### SSL Certificate (Optional)
```bash
# Create SSL directory
mkdir ssl

# Add your certificates
# certificate.crt -> ssl/certificate.crt
# private.key -> ssl/private.key

# Update nginx.conf for SSL
```

### Domain Configuration
Update `nginx.conf`:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

## 🎉 Success!

Your Next.js application is now containerized and ready for deployment! 

The setup includes:
- ✅ Docker containerization
- ✅ Nginx reverse proxy
- ✅ Environment configuration
- ✅ Deployment scripts
- ✅ Health monitoring
- ✅ Log management

You can now deploy this to any server with Docker installed!
