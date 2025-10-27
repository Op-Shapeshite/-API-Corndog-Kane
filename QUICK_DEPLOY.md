# Quick Deployment Commands

## On Your VPS (First Time Setup)

```bash
# 1. Clone and setup
sudo mkdir -p /home/kane
cd /home/kane
git clone YOUR_REPO_URL Corndog-Kane-API
cd Corndog-Kane-API

# 2. Make scripts executable
chmod +x scripts/*.sh

# 3. Run setup script
sudo ./scripts/setup-server.sh

# 4. Edit environment variables
nano .env

# 5. Copy systemd service file
sudo cp scripts/corndog-kane-api.service /etc/systemd/system/

# 6. Create log directory
sudo mkdir -p /var/log/corndog-kane-api
sudo chown -R kane:kane /var/log/corndog-kane-api

# 7. Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable corndog-kane-api
sudo systemctl start corndog-kane-api
sudo systemctl status corndog-kane-api
```

## On GitHub

```bash
# Add these secrets in GitHub repo → Settings → Secrets and variables → Actions:
VPS_HOST=123.456.789.0
VPS_PORT=22
VPS_USERNAME=kane
VPS_PASSWORD=your_password
```

## Grant Sudo Permissions

```bash
# Run on VPS
sudo visudo

# Add this line:
kane ALL=(ALL) NOPASSWD: /bin/systemctl restart corndog-kane-api, /bin/systemctl status corndog-kane-api, /bin/systemctl stop corndog-kane-api, /bin/systemctl start corndog-kane-api
```

## Common Commands

```bash
# View logs (real-time)
sudo journalctl -u corndog-kane-api -f

# Restart service
sudo systemctl restart corndog-kane-api

# Check status
sudo systemctl status corndog-kane-api

# Manual deployment
cd /home/kane/Corndog-Kane-API
./scripts/deploy.sh
```

## Test Deployment

```bash
# After deployment, test the API
curl http://localhost:3000/health
curl http://YOUR_DOMAIN/health
```

## Troubleshooting

```bash
# Service won't start?
sudo journalctl -u corndog-kane-api -n 50

# Port in use?
sudo lsof -i :3000

# Check permissions
ls -la /home/kane/Corndog-Kane-API

# Rebuild manually
npm install
npm run build
npx prisma generate
sudo systemctl restart corndog-kane-api
```
