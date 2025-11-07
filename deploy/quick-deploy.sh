#!/bin/bash

# Quick deployment script - runs both setup and deploy
# Use this for first-time deployment

set -e

echo "🚀 Quick Deployment Script for RN Firebase Chat MCP Server"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/home/locnguyent/rn-firebase-chat-rag"

# Check if we're on the VPS
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: ${PROJECT_DIR}${NC}"
    echo "Please ensure the project is uploaded to the VPS first."
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: VPS Setup (requires sudo)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    echo -e "${GREEN}✓ Running with root privileges${NC}"
    bash "$PROJECT_DIR/deploy/setup-vps.sh"
else
    echo -e "${YELLOW}⚠️  Need sudo privileges for VPS setup${NC}"
    echo "Running setup with sudo..."
    sudo bash "$PROJECT_DIR/deploy/setup-vps.sh"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Application Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Switch to locnguyent user if not already
if [ "$USER" != "locnguyent" ]; then
    echo -e "${YELLOW}⚠️  Switching to user 'locnguyent' for deployment${NC}"
    su - locnguyent -c "cd $PROJECT_DIR && bash deploy/deploy.sh"
else
    cd "$PROJECT_DIR"
    bash deploy/deploy.sh
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Quick Deployment Completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}🧪 Testing the deployment...${NC}"
echo ""

# Wait for service to be ready
sleep 3

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:4001/health || echo "failed")

if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Response: $HEALTH_RESPONSE"
fi

echo ""
echo -e "${YELLOW}Testing MCP server info...${NC}"
INFO_RESPONSE=$(curl -s http://localhost:4001/ || echo "failed")

if [[ $INFO_RESPONSE == *"rn-firebase-chat"* ]]; then
    echo -e "${GREEN}✓ MCP server info retrieved${NC}"
    echo "$INFO_RESPONSE" | jq '.' 2>/dev/null || echo "$INFO_RESPONSE"
else
    echo -e "${RED}❌ Failed to get MCP server info${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Deployment Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}🌐 URLs:${NC}"
echo -e "   Local:  http://localhost:4001"
echo -e "   Public: http://rn-firebase-chat-mcp.rnbase.online"
echo ""
echo -e "${YELLOW}🔧 Service:${NC}"
echo -e "   Status: sudo systemctl status rn-firebase-chat-mcp"
echo -e "   Logs:   sudo journalctl -u rn-firebase-chat-mcp -f"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "   1. Test the API: curl http://rn-firebase-chat-mcp.rnbase.online/health"
echo -e "   2. Enable HTTPS: sudo certbot --nginx -d rn-firebase-chat-mcp.rnbase.online"
echo -e "   3. Monitor logs: sudo journalctl -u rn-firebase-chat-mcp -f"
echo ""

