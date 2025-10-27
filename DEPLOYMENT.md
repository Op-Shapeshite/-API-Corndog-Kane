# Deployment Guide - Corndog Kane API

## Prerequisites

Before deploying, make sure you have:
- Ubuntu Server VPS with root/sudo access
- Git installed on VPS
- GitHub repository access

## Initial Server Setup

### 1. Run the Setup Script on Your VPS

SSH into your VPS and run:

```bash
# Download the setup script
wget https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/master/scripts/setup-server.sh

# Make it executable
chmod +x setup-server.sh

# Run the setup
./setup-server.sh
```

Or manually clone the repo first:

```bash
# Create directory
sudo mkdir -p /home/kane
cd /home/kane

# Clone repository
git clone YOUR_REPO_URL Corndog-Kane-API

# Run setup
cd Corndog-Kane-API
chmod +x scripts/setup-server.sh
sudo ./scripts/setup-server.sh
```

### 2. Configure Environment Variables

Edit the `.env` file:

```bash
nano /home/kane/Corndog-Kane-API/.env
```

Make sure all required variables are set properly.

### 3. Setup GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `VPS_HOST`: Your VPS IP address (e.g., `123.456.789.0`)
- `VPS_PORT`: SSH port (usually `22`)
- `VPS_USERNAME`: `kane`
- `VPS_PASSWORD`: Your VPS user password

### 4. Grant Sudo Permissions for Service Management

The deployment needs to restart the systemd service. Add this to sudoers:

```bash
sudo visudo
```

Add this line (replace `kane` with your username if different):

```
kane ALL=(ALL) NOPASSWD: /bin/systemctl restart corndog-kane-api, /bin/systemctl status corndog-kane-api, /bin/systemctl stop corndog-kane-api, /bin/systemctl start corndog-kane-api
```

## Automatic Deployment

Once setup is complete, every push to `master` branch will automatically:

1. ✅ Connect to your VPS via SSH
2. ✅ Pull latest code from GitHub
3. ✅ Install dependencies
4. ✅ Build the application (`npm run build`)
5. ✅ Generate Prisma client
6. ✅ Run database migrations (`prisma migrate deploy`)
7. ✅ Restart the application service
8. ✅ Verify the service is running

## Manual Deployment

If you need to deploy manually:

```bash
# SSH into your VPS
ssh kane@YOUR_VPS_IP

# Run the deployment script
cd /home/kane/Corndog-Kane-API
./scripts/deploy.sh
```

## Service Management

### Check Service Status
```bash
sudo systemctl status corndog-kane-api
```

### View Logs (Real-time)
```bash
sudo journalctl -u corndog-kane-api -f
```

### View Recent Logs
```bash
sudo journalctl -u corndog-kane-api -n 100
```

### Restart Service
```bash
sudo systemctl restart corndog-kane-api
```

### Stop Service
```bash
sudo systemctl stop corndog-kane-api
```

### Start Service
```bash
sudo systemctl start corndog-kane-api
```

### View Log Files
```bash
# Output logs
tail -f /var/log/corndog-kane-api/output.log

# Error logs
tail -f /var/log/corndog-kane-api/error.log
```

## Nginx Configuration (Optional)

If you installed Nginx during setup, you can enable HTTPS:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## Troubleshooting

### Service won't start
```bash
# Check service status
sudo systemctl status corndog-kane-api

# Check detailed logs
sudo journalctl -u corndog-kane-api -n 100 --no-pager

# Check if port is already in use
sudo lsof -i :3000
```

### Database connection issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
psql $DATABASE_URL
```

### Build errors
```bash
# Check Node.js version
node --version  # Should be LTS version

# Clear node_modules and rebuild
cd /home/kane/Corndog-Kane-API
rm -rf node_modules
npm install
npm run build
```

### GitHub Actions deployment fails

1. Check GitHub secrets are set correctly
2. Verify SSH access: `ssh kane@YOUR_VPS_IP`
3. Check GitHub Actions logs for specific errors
4. Ensure sudoers is configured for systemctl commands

## Security Recommendations

1. **Use SSH Keys instead of password**
   ```bash
   # Generate key on your local machine
   ssh-keygen -t ed25519 -C "github-actions"
   
   # Copy to VPS
   ssh-copy-id kane@YOUR_VPS_IP
   
   # Update GitHub secret to use SSH_PRIVATE_KEY instead of password
   ```

2. **Enable UFW Firewall**
   ```bash
   sudo ufw status
   ```

3. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Use environment-specific configurations**
   - Never commit `.env` file
   - Use different databases for production

## Rollback

If deployment fails, you can rollback:

```bash
cd /home/kane/Corndog-Kane-API

# View commit history
git log --oneline

# Rollback to previous commit
git reset --hard COMMIT_HASH

# Run deployment script
./scripts/deploy.sh
```

## Monitoring

### Check Application Health
```bash
curl http://localhost:3000/health
```

### Monitor System Resources
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Check service memory usage
systemctl status corndog-kane-api
```

## Backup

Regular backups are recommended:

```bash
# Database backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Application backup
tar -czf corndog-backup-$(date +%Y%m%d).tar.gz /home/kane/Corndog-Kane-API
```
