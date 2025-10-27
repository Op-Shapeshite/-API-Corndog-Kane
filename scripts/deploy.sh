#!/bin/bash

# Corndog Kane API - Deployment Script
# This script handles the deployment process

set -e  # Exit on any error

APP_DIR="/home/kane/Corndog-Kane-API"
SERVICE_NAME="corndog-kane-api"

echo "=========================================="
echo "Deploying Corndog Kane API"
echo "=========================================="

# Navigate to app directory
cd $APP_DIR

# Show current version/commit
echo "📌 Current commit:"
git log -1 --oneline

# Pull latest changes
echo "📥 Pulling latest changes from master..."
git pull origin master

# Show new version/commit
echo "📌 New commit:"
git log -1 --oneline

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install --production=false

# Build the application
echo "🔨 Building application..."
npm run build

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Restart the service
echo "🔄 Restarting service..."
sudo systemctl restart $SERVICE_NAME

# Wait a moment for the service to start
sleep 2

# Check if service is running
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ Service is running"
    sudo systemctl status $SERVICE_NAME --no-pager
else
    echo "❌ Service failed to start"
    sudo journalctl -u $SERVICE_NAME -n 50 --no-pager
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Deployment completed successfully!"
echo "=========================================="
echo ""
echo "📊 Useful commands:"
echo "   View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "   Restart: sudo systemctl restart $SERVICE_NAME"
echo "   Stop: sudo systemctl stop $SERVICE_NAME"
echo "   Status: sudo systemctl status $SERVICE_NAME"
echo ""
