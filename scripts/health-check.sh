#!/bin/bash

# Health Check Script
# Verifies the deployment is successful

HOST=${1:-localhost}
PORT=${2:-3000}

echo "🔍 Checking Corndog Kane API health..."
echo "Host: $HOST"
echo "Port: $PORT"
echo ""

# Check if service is responding
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$HOST:$PORT/health 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API is healthy (HTTP $HTTP_CODE)"
    
    # Try to get more details
    RESPONSE=$(curl -s http://$HOST:$PORT/health 2>/dev/null)
    if [ ! -z "$RESPONSE" ]; then
        echo ""
        echo "Response:"
        echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    fi
    
    exit 0
elif [ "$HTTP_CODE" = "000" ]; then
    echo "❌ Cannot connect to API"
    echo "   Make sure the service is running: sudo systemctl status corndog-kane-api"
    exit 1
else
    echo "⚠️  API returned HTTP $HTTP_CODE"
    exit 1
fi
