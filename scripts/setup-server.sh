#!/bin/bash

# Corndog Kane API - Server Setup Script for Ubuntu
# This script sets up the VPS for the first time

set -e  # Exit on any error

echo "=========================================="
echo "Corndog Kane API - Server Setup"
echo "=========================================="

# Update system packages
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install essential tools
echo "🔧 Installing essential tools..."
sudo apt install -y curl wget git build-essential

# Install Node.js (using NodeSource repository for latest LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
echo "✅ Verifying installations..."
node --version
npm --version

# Install PostgreSQL (required)
echo "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
echo "✅ PostgreSQL installed and started"

# Display PostgreSQL version
sudo -u postgres psql --version

# Install Redis (if not already installed)
read -p "Do you want to install Redis? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing Redis..."
    sudo apt install -y redis-server
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    echo "✅ Redis installed and started"
fi

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /home/kane/Corndog-Kane-API
sudo chown -R $USER:$USER /home/kane/Corndog-Kane-API

# Clone repository
echo "📥 Cloning repository..."
read -p "Enter your GitHub repository URL: " REPO_URL
cd /home/kane
git clone $REPO_URL Corndog-Kane-API || echo "Directory already exists, skipping clone..."

# Navigate to app directory
cd /home/kane/Corndog-Kane-API

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Setup environment file
echo "📝 Setting up environment file..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/corndog_kane"

# Server
PORT=3000
NODE_ENV=production

# Add your other environment variables here
EOF
    echo "⚠️  Please edit /home/kane/Corndog-Kane-API/.env with your actual values!"
else
    echo ".env file already exists, skipping..."
fi

# Create systemd service
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/corndog-kane-api.service > /dev/null << 'EOF'
[Unit]
Description=Corndog Kane API Service
After=network.target postgresql.service

[Service]
Type=simple
User=kane
WorkingDirectory=/home/kane/Corndog-Kane-API
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/corndog-kane-api/output.log
StandardError=append:/var/log/corndog-kane-api/error.log

# Security settings
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Create log directory
echo "📁 Creating log directory..."
sudo mkdir -p /var/log/corndog-kane-api
sudo chown -R kane:kane /var/log/corndog-kane-api

# Setup Nginx (optional)
read -p "Do you want to install and configure Nginx as reverse proxy? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing Nginx..."
    sudo apt install -y nginx
    
    read -p "Enter your domain name (e.g., api.example.com): " DOMAIN_NAME
    
    sudo tee /etc/nginx/sites-available/corndog-kane-api > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/corndog-kane-api /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    echo "✅ Nginx configured for $DOMAIN_NAME"
    echo "💡 To enable HTTPS, run: sudo certbot --nginx -d $DOMAIN_NAME"
fi

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full' || sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Build the application
echo "🔨 Building application..."
npm run build

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations (optional, requires DB to be configured)
read -p "Do you want to run database migrations now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate deploy || echo "⚠️  Migration failed. Please check your DATABASE_URL in .env"
fi

# Reload systemd and start service
echo "🚀 Starting application service..."
sudo systemctl daemon-reload
sudo systemctl enable corndog-kane-api
sudo systemctl start corndog-kane-api

# Check service status
echo ""
echo "📊 Service status:"
sudo systemctl status corndog-kane-api --no-pager

echo ""
echo "=========================================="
echo "✅ Setup completed!"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "1. Edit the .env file: nano /home/kane/Corndog-Kane-API/.env"
echo "2. Restart the service: sudo systemctl restart corndog-kane-api"
echo "3. View logs: sudo journalctl -u corndog-kane-api -f"
echo "4. Check status: sudo systemctl status corndog-kane-api"
echo ""
echo "🔐 Don't forget to set up GitHub secrets:"
echo "   - VPS_HOST: Your VPS IP address"
echo "   - VPS_PORT: SSH port (usually 22)"
echo "   - VPS_USERNAME: kane"
echo "   - VPS_PASSWORD: Your password"
echo ""
