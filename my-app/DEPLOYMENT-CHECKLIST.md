# ✅ Server Deployment Checklist

## 🔐 SSH Connection
- [ ] SSH key set up (recommended) or password access
- [ ] Can connect to server: `ssh houssem@104.248.134.98`

## 📦 Project Upload
- [ ] Project uploaded to server
- [ ] All files present in `~/my-app/`

## 🛠️ Server Setup
- [ ] System updated: `sudo apt update && sudo apt upgrade -y`
- [ ] Docker installed and working
- [ ] Docker Compose installed and working
- [ ] User added to docker group
- [ ] Logged out and back in for group changes

## ⚙️ Environment Configuration
- [ ] `.env` file created from `env.example`
- [ ] `DATABASE_URL` configured
- [ ] `NEXTAUTH_URL` set to server IP or domain
- [ ] `NEXTAUTH_SECRET` generated and set
- [ ] Other environment variables configured

## 🚀 Application Deployment
- [ ] Docker images built successfully
- [ ] Application containers running
- [ ] Nginx container running
- [ ] Application accessible at http://104.248.134.98
- [ ] Health check endpoint working

## 🔧 Optional Configurations
- [ ] Domain name configured in nginx.conf
- [ ] SSL certificates installed (if using domain)
- [ ] Firewall configured (UFW)
- [ ] Systemd service created for auto-start
- [ ] SSL certificate auto-renewal set up

## 📊 Monitoring & Maintenance
- [ ] Logs accessible and monitored
- [ ] Backup strategy implemented
- [ ] Update process tested
- [ ] Resource monitoring set up

## 🎯 Final Verification
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Database connections working
- [ ] All features functional
- [ ] Performance acceptable

## 📋 Quick Commands Reference

```bash
# Connect to server
ssh houssem@104.248.134.98

# Check application status
docker-compose -f docker-compose.nginx.yml ps

# View logs
docker-compose -f docker-compose.nginx.yml logs -f

# Restart application
docker-compose -f docker-compose.nginx.yml restart

# Update application
git pull && docker-compose -f docker-compose.nginx.yml up -d --build

# Check system service
sudo systemctl status my-app

# View system logs
sudo journalctl -u my-app.service -f
```

## 🚨 Emergency Commands

```bash
# Stop application
docker-compose -f docker-compose.nginx.yml down

# Stop system service
sudo systemctl stop my-app

# Restart everything
sudo systemctl restart my-app

# Check what's using port 80
sudo netstat -tulpn | grep :80

# Kill process using port 80
sudo kill -9 <PID>
```

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose -f docker-compose.nginx.yml logs`
2. Verify environment variables: `cat .env`
3. Test database connection
4. Check firewall settings: `sudo ufw status`
5. Verify Docker is running: `sudo systemctl status docker`

Your application should be live at: **http://104.248.134.98** 🚀
