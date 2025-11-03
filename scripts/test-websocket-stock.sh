#!/bin/bash

# WebSocket Stock Events - Quick Test Script
# This script tests the WebSocket stock events functionality

echo "🧪 WebSocket Stock Events - Testing Script"
echo "==========================================="
echo ""

# Configuration
API_URL="${API_URL:-http://localhost:8080}"
TOKEN="${AUTH_TOKEN:-your-token-here}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📍 API URL: ${API_URL}${NC}"
echo -e "${BLUE}🔑 Using Token: ${TOKEN:0:20}...${NC}"
echo ""

# Function to test order creation
test_order_creation() {
    echo -e "${YELLOW}🛒 Testing Order Creation (Product Stock Change)${NC}"
    echo "------------------------------------------------"
    
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/orders" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "payment_method": "CASH",
        "items": [
          {
            "product_id": 1,
            "qty": 5
          }
        ]
      }')
    
    if echo "$RESPONSE" | grep -q '"message"'; then
        echo -e "${GREEN}✅ Order created successfully${NC}"
        echo "$RESPONSE" | jq '.'
        echo ""
        echo -e "${GREEN}🔔 Check WebSocket client for product stock change event!${NC}"
    else
        echo -e "${RED}❌ Failed to create order${NC}"
        echo "$RESPONSE"
    fi
    
    echo ""
}

# Function to test product request approval
test_product_approval() {
    echo -e "${YELLOW}📦 Testing Product Request Approval${NC}"
    echo "------------------------------------------------"
    
    # Note: Replace request_id with actual UUID from your database
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/outlet-requests/approve" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "outlet_id": 1,
        "product_requests": [
          {
            "request_id": "replace-with-actual-uuid",
            "approval_quantity": 50
          }
        ]
      }')
    
    if echo "$RESPONSE" | grep -q '"success"'; then
        echo -e "${GREEN}✅ Product request approved${NC}"
        echo "$RESPONSE" | jq '.'
        echo ""
        echo -e "${GREEN}🔔 Check WebSocket client for product stock change event!${NC}"
    else
        echo -e "${RED}❌ Failed to approve request${NC}"
        echo "$RESPONSE"
    fi
    
    echo ""
}

# Function to test material request approval
test_material_approval() {
    echo -e "${YELLOW}🧱 Testing Material Request Approval${NC}"
    echo "------------------------------------------------"
    
    # Note: Replace request_id with actual UUID from your database
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/outlet-requests/approve" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "outlet_id": 1,
        "material_requests": [
          {
            "request_id": "replace-with-actual-uuid",
            "approval_quantity": 100
          }
        ]
      }')
    
    if echo "$RESPONSE" | grep -q '"success"'; then
        echo -e "${GREEN}✅ Material request approved${NC}"
        echo "$RESPONSE" | jq '.'
        echo ""
        echo -e "${GREEN}🔔 Check WebSocket client for material stock change event!${NC}"
    else
        echo -e "${RED}❌ Failed to approve request${NC}"
        echo "$RESPONSE"
    fi
    
    echo ""
}

# Main menu
show_menu() {
    echo ""
    echo "Select a test to run:"
    echo "1) Test Order Creation (Product Stock Change)"
    echo "2) Test Product Request Approval"
    echo "3) Test Material Request Approval"
    echo "4) Run All Tests"
    echo "5) Exit"
    echo ""
    read -p "Enter choice [1-5]: " choice
    
    case $choice in
        1)
            test_order_creation
            show_menu
            ;;
        2)
            test_product_approval
            show_menu
            ;;
        3)
            test_material_approval
            show_menu
            ;;
        4)
            test_order_creation
            sleep 2
            test_product_approval
            sleep 2
            test_material_approval
            show_menu
            ;;
        5)
            echo -e "${BLUE}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            show_menu
            ;;
    esac
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: 'jq' is not installed. JSON output will not be formatted.${NC}"
    echo "Install jq: sudo apt-get install jq (Ubuntu/Debian) or brew install jq (Mac)"
    echo ""
fi

# Instructions
echo -e "${GREEN}📋 Instructions:${NC}"
echo "1. Make sure the API server is running"
echo "2. Open http://localhost:8080/stock-monitor.html in your browser"
echo "3. Click 'Connect' and join appropriate rooms"
echo "4. Run tests from this script"
echo "5. Watch the events appear in the browser!"
echo ""

# Show menu
show_menu
