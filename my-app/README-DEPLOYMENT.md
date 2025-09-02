# Deployment Guide - Docker & Nginx

This guide will help you deploy your Next.js application using Docker and Nginx.

## Prerequisites

- Docker installed on your server
- Docker Compose installed
- A domain name (optional, for SSL)
- PostgreSQL database (can be external or local)

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@your-db-host:5432/your-db-name"

# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"  # or http://localhost for local testing
NEXTAUTH_SECRET="generate-a-secure-secret-key"

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

### 2. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

### 3. Deploy with Docker Compose

#### Option A: With Nginx (Recommended for Production)

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Or manually:

```bash
# Build and start
docker-compose -f docker-compose.nginx.yml up -d --build

# Check logs
docker-compose -f docker-compose.nginx.yml logs -f
```

#### Option B: Without Nginx (Development)

```bash
docker-compose up -d --build
```

### 4. Database Setup

If using the included PostgreSQL container:

```bash
# Run database migrations
docker-compose exec app npx prisma migrate deploy
```

If using external database:

```bash
# Set DATABASE_URL in .env to your external database
# Then run migrations
npx prisma migrate deploy
```

## Production Deployment

### 1. Server Preparation

Install Docker and Docker Compose on your server:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose
```

### 2. SSL Certificate (Optional)

For HTTPS, create an SSL directory and add your certificates:

```bash
mkdir ssl
# Add your certificate files to ssl/ directory
```

Update `nginx.conf` to include SSL configuration.

### 3. Domain Configuration

Update the `server_name` in `nginx.conf` with your domain:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 4. Deploy

```bash
# Clone your repository
git clone <your-repo-url>
cd my-app

# Set up environment
cp env.example .env
# Edit .env with your values

# Deploy
./deploy.sh
```

## Monitoring and Maintenance

### View Logs

```bash
# Application logs
docker-compose -f docker-compose.nginx.yml logs app

# Nginx logs
docker-compose -f docker-compose.nginx.yml logs nginx

# All logs
docker-compose -f docker-compose.nginx.yml logs -f
```

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.nginx.yml up -d --build
```

### Backup Database

```bash
# If using local PostgreSQL
docker-compose exec db pg_dump -U postgres myapp > backup.sql

# Restore
docker-compose exec -T db psql -U postgres myapp < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change ports in docker-compose files
2. **Database connection failed**: Check DATABASE_URL in .env
3. **Permission denied**: Run with sudo or add user to docker group
4. **Build fails**: Check Dockerfile and dependencies

### Health Check

```bash
# Check if application is running
curl http://localhost/health

# Check container status
docker-compose -f docker-compose.nginx.yml ps
```

### Clean Up

```bash
# Stop and remove containers
docker-compose -f docker-compose.nginx.yml down

# Remove images
docker-compose -f docker-compose.nginx.yml down --rmi all

# Remove volumes (WARNING: This will delete data)
docker-compose -f docker-compose.nginx.yml down -v
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use strong passwords and limit access
3. **SSL**: Always use HTTPS in production
4. **Updates**: Keep Docker images updated
5. **Firewall**: Configure server firewall appropriately

## Performance Optimization

1. **Caching**: Nginx is configured with static file caching
2. **Compression**: Gzip compression is enabled
3. **Load Balancing**: Can be extended with multiple app instances
4. **Monitoring**: Consider adding monitoring tools like Prometheus

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Test database connectivity
4. Check network connectivity
