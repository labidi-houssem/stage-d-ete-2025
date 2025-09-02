# 🚀 Complete Server Deployment Guide

This guide will walk you through deploying your Next.js application to your server at `104.248.134.98`.

## 📋 Prerequisites

- SSH access to your server
- Domain name (optional, for SSL)
- PostgreSQL database (external or local)

## 🔐 Step 1: Connect to Your Server

### Option A: Using SSH Key (Recommended)
```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy your public key to the server
ssh-copy-id houssem@104.248.134.98

# Connect to server
ssh houssem@104.248.134.98
```

### Option B: Using Password
```bash
ssh houssem@104.248.134.98
# Enter your password when prompted
```

## 📦 Step 2: Upload Your Project

### Option A: Using Git (Recommended)
```bash
# On your server
cd ~
git clone <your-repository-url> my-app
cd my-app
```

### Option B: Using SCP
```bash
# From your local machine
scp -r . houssem@104.248.134.98:~/my-app
```

### Option C: Using rsync
```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.next' . houssem@104.248.134.98:~/my-app/
```

## 🛠️ Step 3: Server Setup

### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for Docker group changes
exit
# SSH back in
ssh houssem@104.248.134.98
```

## ⚙️ Step 4: Configure Environment

```bash
cd ~/my-app

# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

### Required Environment Variables
```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@your-db-host:5432/your-db-name"

# NextAuth Configuration
NEXTAUTH_URL="http://104.248.134.98"  # or your domain
NEXTAUTH_SECRET="generate-a-secure-secret-key"

# Generate a secure secret
openssl rand -base64 32
```

## 🚀 Step 5: Deploy Application

### Option A: Using the Automated Script
```bash
# Make script executable
chmod +x deploy-to-server.sh

# Run deployment
./deploy-to-server.sh
```

### Option B: Manual Deployment
```bash
# Build and start
docker-compose -f docker-compose.nginx.yml up -d --build

# Check status
docker-compose -f docker-compose.nginx.yml ps

# View logs
docker-compose -f docker-compose.nginx.yml logs -f
```

## 🌐 Step 6: Configure Domain (Optional)

### Update Nginx Configuration
```bash
# Edit nginx.conf
nano nginx.conf
```

Replace `server_name localhost;` with:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

### Restart Nginx
```bash
docker-compose -f docker-compose.nginx.yml restart nginx
```

## 🔒 Step 7: Set Up SSL (Optional)

### Using Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Create SSL directory
mkdir ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/certificate.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/private.key

# Update nginx.conf for SSL
nano nginx.conf
```

### SSL Nginx Configuration
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Proxy settings
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Step 8: Set Up Auto-Start

```bash
# Create systemd service
sudo tee /etc/systemd/system/my-app.service > /dev/null <<EOF
[Unit]
Description=My App Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/houssem/my-app
ExecStart=/usr/local/bin/docker-compose -f docker-compose.nginx.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.nginx.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable my-app.service
sudo systemctl start my-app.service
```

## 🔥 Step 9: Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

## 📊 Step 10: Monitoring & Maintenance

### View Logs
```bash
# Application logs
docker-compose -f docker-compose.nginx.yml logs -f app

# Nginx logs
docker-compose -f docker-compose.nginx.yml logs -f nginx

# System logs
sudo journalctl -u my-app.service -f
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.nginx.yml up -d --build

# Or restart service
sudo systemctl restart my-app
```

### Backup Database
```bash
# Create backup
docker-compose exec db pg_dump -U postgres myapp > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T db psql -U postgres myapp < backup_file.sql
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 80
   sudo netstat -tulpn | grep :80
   # Kill process or change ports
   ```

2. **Permission denied**
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   # Log out and back in
   ```

3. **Database connection failed**
   ```bash
   # Check DATABASE_URL in .env
   # Test connection
   docker-compose exec app npx prisma db push
   ```

4. **SSL certificate issues**
   ```bash
   # Renew Let's Encrypt certificate
   sudo certbot renew
   # Copy new certificates
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/certificate.crt
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/private.key
   # Restart nginx
   docker-compose -f docker-compose.nginx.yml restart nginx
   ```

### Health Checks
```bash
# Check if app is running
curl http://localhost/health

# Check container status
docker-compose -f docker-compose.nginx.yml ps

# Check service status
sudo systemctl status my-app
```

## 🎉 Success!

Your application should now be accessible at:
- **HTTP**: http://104.248.134.98
- **HTTPS**: https://yourdomain.com (if configured)

## 📋 Useful Commands

```bash
# Start application
sudo systemctl start my-app

# Stop application
sudo systemctl stop my-app

# Restart application
sudo systemctl restart my-app

# View logs
sudo journalctl -u my-app.service -f

# Update application
cd ~/my-app
git pull
docker-compose -f docker-compose.nginx.yml up -d --build

# Backup
docker-compose exec db pg_dump -U postgres myapp > backup.sql

# Monitor resources
docker stats
htop
```

## 🔄 SSL Certificate Renewal

Set up automatic renewal:
```bash
# Add to crontab
sudo crontab -e

# Add this line (runs twice daily)
0 12 * * * /usr/bin/certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /home/houssem/my-app/ssl/certificate.crt && cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /home/houssem/my-app/ssl/private.key && docker-compose -f /home/houssem/my-app/docker-compose.nginx.yml restart nginx
```

Your application is now deployed and ready for production! 🚀
