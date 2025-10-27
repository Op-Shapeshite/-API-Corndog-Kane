# CI/CD Setup - Corndog Kane API

## 🚀 Overview

This repository includes a complete CI/CD pipeline that automatically deploys your application to your VPS using GitHub Actions and systemd.

## 📦 What's Included

### GitHub Actions Workflow
- **File**: `.github/workflows/deploy.yml`
- **Trigger**: Automatic deployment on push to `master` branch
- **Process**: Pull code → Install deps → Build → Migrate DB → Restart service

### Server Scripts
- **`scripts/setup-server.sh`**: Initial server setup (run once)
- **`scripts/deploy.sh`**: Manual deployment script
- **`scripts/health-check.sh`**: Health check verification
- **`scripts/corndog-kane-api.service`**: Systemd service configuration

### Documentation
- **`DEPLOYMENT.md`**: Comprehensive deployment guide
- **`QUICK_DEPLOY.md`**: Quick reference commands
- **`README_CICD.md`**: This file

## 🎯 Quick Start

### Step 1: Setup Your VPS

SSH into your VPS and run:

```bash
# Create directory
sudo mkdir -p /home/kane
cd /home/kane

# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git Corndog-Kane-API

# Make scripts executable
cd Corndog-Kane-API
chmod +x scripts/*.sh

# Run setup script
sudo ./scripts/setup-server.sh
```

The setup script will:
- ✅ Install Node.js (LTS)
- ✅ Install PostgreSQL (optional)
- ✅ Install Redis (optional)
- ✅ Install Nginx (optional)
- ✅ Create systemd service
- ✅ Configure firewall
- ✅ Build and start the application

### Step 2: Configure Environment

Edit the `.env` file on your VPS:

```bash
nano /home/kane/Corndog-Kane-API/.env
```

Update with your production values (database, ports, secrets, etc.)

### Step 3: Setup GitHub Secrets

In your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_HOST` | Your VPS IP address | `123.456.789.0` |
| `VPS_PORT` | SSH port | `22` |
| `VPS_USERNAME` | VPS username | `kane` |
| `VPS_PASSWORD` | VPS user password | `your-secure-password` |

### Step 4: Grant Sudo Permissions

On your VPS, run:

```bash
sudo visudo
```

Add this line (replace `kane` with your username):

```
kane ALL=(ALL) NOPASSWD: /bin/systemctl restart corndog-kane-api, /bin/systemctl status corndog-kane-api, /bin/systemctl stop corndog-kane-api, /bin/systemctl start corndog-kane-api
```

### Step 5: Deploy!

Push to master branch:

```bash
git add .
git commit -m "Setup CI/CD"
git push origin master
```

GitHub Actions will automatically deploy your application! 🎉

## 🔄 How It Works

### Automatic Deployment Flow

1. **You push code to `master` branch**
   ```bash
   git push origin master
   ```

2. **GitHub Actions triggers**
   - Connects to your VPS via SSH
   - Runs deployment commands

3. **Deployment Process**
   ```
   Pull latest code
   ↓
   npm install
   ↓
   npm run build
   ↓
   prisma generate
   ↓
   prisma migrate deploy
   ↓
   systemctl restart corndog-kane-api
   ↓
   Verify service is running
   ```

4. **Your app is live!** ✅

### Systemd Service

The application runs as a systemd service with:
- **Auto-restart** on failure
- **Logging** to `/var/log/corndog-kane-api/`
- **Security hardening** (NoNewPrivileges, PrivateTmp, etc.)
- **Dependency management** (starts after PostgreSQL/Redis)

## 🛠️ Manual Operations

### Deploy Manually

```bash
ssh kane@YOUR_VPS_IP
cd /home/kane/Corndog-Kane-API
./scripts/deploy.sh
```

### Service Management

```bash
# Check status
sudo systemctl status corndog-kane-api

# View logs (real-time)
sudo journalctl -u corndog-kane-api -f

# Restart service
sudo systemctl restart corndog-kane-api

# Stop service
sudo systemctl stop corndog-kane-api

# Start service
sudo systemctl start corndog-kane-api
```

### Health Check

```bash
# Run health check script
./scripts/health-check.sh

# Or manually
curl http://localhost:3000/api/v1/health
```

## 📊 Monitoring

### View Logs

```bash
# Real-time logs
sudo journalctl -u corndog-kane-api -f

# Last 100 lines
sudo journalctl -u corndog-kane-api -n 100

# Log files
tail -f /var/log/corndog-kane-api/output.log
tail -f /var/log/corndog-kane-api/error.log
```

### Check Service Health

```bash
# Service status
sudo systemctl status corndog-kane-api

# Is service running?
systemctl is-active corndog-kane-api

# Check process
ps aux | grep node
```

### Monitor Resources

```bash
# System resources
htop

# Disk usage
df -h

# Service memory
systemctl status corndog-kane-api
```

## 🔒 Security Best Practices

### 1. Use SSH Keys (Recommended)

Instead of using password authentication:

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-deploy"

# Copy public key to VPS
ssh-copy-id kane@YOUR_VPS_IP

# In GitHub, replace VPS_PASSWORD secret with:
# SSH_PRIVATE_KEY: (paste your private key)
```

Then update `.github/workflows/deploy.yml`:

```yaml
- name: Deploy to VPS
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USERNAME }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}  # Changed from password
    port: ${{ secrets.VPS_PORT }}
    script: |
      # ... rest of script
```

### 2. Enable Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 3. SSL/HTTPS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 4. Environment Variables

- Never commit `.env` file
- Use different credentials for production
- Rotate secrets regularly

## 🐛 Troubleshooting

### Deployment Fails

**Check GitHub Actions logs:**
1. Go to your repository → Actions tab
2. Click on the failed workflow
3. Review the error messages

**Common issues:**
- SSH connection failed → Check VPS_HOST, VPS_PORT, credentials
- Permission denied → Check sudoers configuration
- Service won't start → Check logs with `sudo journalctl -u corndog-kane-api -n 50`

### Service Won't Start

```bash
# Check service status
sudo systemctl status corndog-kane-api

# View recent logs
sudo journalctl -u corndog-kane-api -n 50

# Check if port is in use
sudo lsof -i :3000

# Test manually
cd /home/kane/Corndog-Kane-API
npm start
```

### Database Issues

```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Test connection
psql $DATABASE_URL

# Run migrations manually
cd /home/kane/Corndog-Kane-API
npx prisma migrate deploy
```

### Build Errors

```bash
# Clear and rebuild
cd /home/kane/Corndog-Kane-API
rm -rf node_modules dist
npm install
npm run build
```

## 🔄 Rollback

If a deployment breaks your app:

```bash
ssh kane@YOUR_VPS_IP
cd /home/kane/Corndog-Kane-API

# View commit history
git log --oneline -10

# Rollback to specific commit
git reset --hard COMMIT_HASH

# Redeploy
./scripts/deploy.sh
```

## 📈 Performance Tips

1. **Enable Nginx caching** for static assets
2. **Use PM2 cluster mode** for multiple instances (if you prefer PM2 over systemd)
3. **Enable gzip compression** in Nginx
4. **Set up database connection pooling**
5. **Use Redis for caching**

## 🎓 Additional Resources

- [Systemd Documentation](https://www.freedesktop.org/software/systemd/man/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Best Practices](https://www.nginx.com/blog/nginx-best-practices/)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)

## 📞 Support

If you encounter issues:

1. Check the logs: `sudo journalctl -u corndog-kane-api -f`
2. Review `DEPLOYMENT.md` for detailed troubleshooting
3. Check GitHub Actions logs for CI/CD issues
4. Verify environment variables are set correctly

## ✅ Checklist

Before going to production:

- [ ] VPS is set up with all dependencies
- [ ] Environment variables are configured
- [ ] GitHub secrets are added
- [ ] Sudoers is configured for systemctl
- [ ] Database is created and accessible
- [ ] Firewall is configured
- [ ] SSL certificate is installed (if using domain)
- [ ] Health check endpoint works
- [ ] Logs are being written correctly
- [ ] Service auto-starts on reboot
- [ ] Backup strategy is in place

---

Happy Deploying! 🚀
