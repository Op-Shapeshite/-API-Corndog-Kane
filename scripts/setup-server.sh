#!/bin/bash

# Corndog Kane API - Server Setup Script for Ubuntu
# This script sets up the VPS for the first time

echo "=========================================="
echo "Corndog Kane API - Server Setup"
echo "=========================================="


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
sudo systemctl start postgresql 2>&1 | grep -v "^$" || true
sudo systemctl enable postgresql  2>&1
echo "✅ PostgreSQL installed and started"

# Display PostgreSQL version
sudo -u postgres psql --version

# Configure PostgreSQL database and user
echo ""
echo "📝 PostgreSQL Configuration"
read -p "Enter PostgreSQL username (default: corndog_user): " PG_USER
PG_USER=${PG_USER:-corndog_user}

read -p "Enter PostgreSQL password: " PG_PASSWORD
while [ -z "$PG_PASSWORD" ]; do
    echo "⚠️  Password cannot be empty!"
    read -p "Enter PostgreSQL password: " PG_PASSWORD
done

read -p "Enter PostgreSQL database name (default: corndog_kane): " PG_DATABASE
PG_DATABASE=${PG_DATABASE:-corndog_kane}

# Create PostgreSQL user and database
echo "🔧 Setting up PostgreSQL user and database..."
sudo -u postgres psql  2>&1 << EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$PG_USER') THEN
        CREATE USER $PG_USER WITH PASSWORD '$PG_PASSWORD';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $PG_DATABASE OWNER $PG_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$PG_DATABASE')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $PG_DATABASE TO $PG_USER;
EOF

echo "✅ PostgreSQL user '$PG_USER' and database '$PG_DATABASE' configured"

# Install Redis (if not already installed)
read -p "Do you want to install Redis? (y/n) " REPLY
if [ "$REPLY" = "y" ] || [ "$REPLY" = "Y" ]; then
    echo "📦 Installing Redis..."
    sudo apt install -y redis-server 
    sudo systemctl start redis-server 2>&1 | grep -v "^$" || true
    sudo systemctl enable redis-server  2>&1
    echo "✅ Redis installed and started"
fi

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /home/kane/Corndog-Kane-API 2>&1 | grep -v "^$" || true
sudo chown -R $USER:$USER /home/kane/Corndog-Kane-API 2>&1 | grep -v "^$" || true

# Clone repository
echo "📥 Cloning repository..."
read -p "Enter your GitHub repository URL: " REPO_URL
cd /home/kane
git clone $REPO_URL Corndog-Kane-API 2>&1 | grep -i "error\|fatal" || echo "Repository cloned or already exists"

# Navigate to app directory
cd /home/kane/Corndog-Kane-API

# Install dependencies
echo "📦 Installing Node.js dependencies..."
if npm install --verbose; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ npm install failed! Retrying with --legacy-peer-deps..."
    if npm install --legacy-peer-deps --verbose; then
        echo "✅ Dependencies installed successfully with --legacy-peer-deps"
    else
        echo "❌ Failed to install dependencies. Please check the errors above."
        exit 1
    fi
fi 

# Setup environment file
echo "📝 Setting up environment file..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://$PG_USER:$PG_PASSWORD@localhost:5432/$PG_DATABASE"

# Server
PORT=3000
NODE_ENV=production

# Add your other environment variables here
EOF
    echo "✅ .env file created with PostgreSQL credentials"
else
    echo ".env file already exists, skipping..."
fi

# Create systemd service
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/corndog-kane-api.service  << 'EOF'
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
sudo mkdir -p /var/log/corndog-kane-api 2>&1 | grep -v "^$" || true
sudo chown -R kane:kane /var/log/corndog-kane-api 2>&1 | grep -v "^$" || true

# Setup Nginx (optional)
read -p "Do you want to install and configure Nginx as reverse proxy? (y/n) " REPLY
if [ "$REPLY" = "y" ] || [ "$REPLY" = "Y" ]; then
    echo "📦 Installing Nginx..."
    sudo apt install -y nginx 
    
    read -p "Enter the port number for Nginx (e.g., 8080): " NGINX_PORT
    NGINX_PORT=${NGINX_PORT:-8080}  # Default to 8080 if empty
    
    sudo tee /etc/nginx/sites-available/corndog-kane-api  << EOF
server {
    listen $NGINX_PORT;
    server_name _;

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
    
    echo "✅ Nginx configured to listen on port $NGINX_PORT"
    echo "💡 Access your API at: http://YOUR_SERVER_IP:$NGINX_PORT"
    
    sudo ln -sf /etc/nginx/sites-available/corndog-kane-api /etc/nginx/sites-enabled/ 2>&1 | grep -v "^$" || true
    sudo nginx -t 2>&1 | grep -E "failed|error" || echo "✓ Nginx configuration valid"
    sudo systemctl restart nginx 2>&1 | grep -v "^$" || true
    sudo systemctl enable nginx  2>&1
fi

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow OpenSSH  2>&1

# Allow Nginx ports
if [ -n "$NGINX_PORT" ] && [ "$NGINX_PORT" != "80" ]; then
    sudo ufw allow $NGINX_PORT  2>&1
    echo "✓ Firewall: Allowed port $NGINX_PORT"
else
    sudo ufw allow 'Nginx Full'  2>&1 || sudo ufw allow 80  2>&1
    sudo ufw allow 443  2>&1
fi

sudo ufw --force enable  2>&1

# Build the application
echo "🔨 Building application..."
if npm run build; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
if npx prisma generate; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Prisma generate failed! Check the errors above."
    exit 1
fi 

# Run migrations (optional, requires DB to be configured)
read -p "Do you want to run database migrations now? (y/n) " REPLY
if [ "$REPLY" = "y" ] || [ "$REPLY" = "Y" ]; then
    npx prisma migrate deploy || echo "⚠️  Migration failed. Please check your DATABASE_URL in .env"
fi

# Reload systemd and start service
echo "🚀 Starting application service..."
sudo systemctl daemon-reload 2>&1 | grep -v "^$" || true
sudo systemctl enable corndog-kane-api  2>&1
sudo systemctl start corndog-kane-api 2>&1 | grep -v "^$" || true

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
