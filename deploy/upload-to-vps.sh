#!/bin/bash

# Upload project to VPS
# Run this from your local machine

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VPS_HOST="10.30.10.35"
VPS_USER="locnguyent"
VPS_PATH="/home/locnguyent/rn-firebase-chat-rag"
LOCAL_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📤 Upload Project to VPS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}Local path:  ${LOCAL_PATH}${NC}"
echo -e "${YELLOW}VPS host:    ${VPS_USER}@${VPS_HOST}${NC}"
echo -e "${YELLOW}VPS path:    ${VPS_PATH}${NC}"
echo ""

# Check if rsync is available
if ! command -v rsync &> /dev/null; then
    echo -e "${RED}❌ rsync is not installed${NC}"
    echo "Please install rsync: brew install rsync (macOS) or apt install rsync (Linux)"
    exit 1
fi

# Ask for confirmation
read -p "Do you want to upload the project to VPS? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Upload cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}📦 Uploading project...${NC}"
echo ""

# Upload using rsync (excludes node_modules, dist, data, logs)
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude 'data/lancedb' \
  --exclude 'logs' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  "${LOCAL_PATH}/" "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Upload completed successfully!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo ""
    echo -e "1. SSH into VPS:"
    echo -e "   ${BLUE}ssh ${VPS_USER}@${VPS_HOST}${NC}"
    echo ""
    echo -e "2. Run deployment (first time):"
    echo -e "   ${BLUE}sudo bash ${VPS_PATH}/deploy/quick-deploy.sh${NC}"
    echo ""
    echo -e "   Or for updates only:"
    echo -e "   ${BLUE}cd ${VPS_PATH} && bash deploy/deploy.sh${NC}"
    echo ""
    echo -e "3. Verify deployment:"
    echo -e "   ${BLUE}curl http://rn-firebase-chat-mcp.rnbase.online/health${NC}"
    echo ""
    
    # Ask if user wants to SSH into VPS
    read -p "Do you want to SSH into VPS now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${YELLOW}🔐 Connecting to VPS...${NC}"
        ssh "${VPS_USER}@${VPS_HOST}"
    fi
else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Upload failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Please check:${NC}"
    echo "  - VPS is accessible: ping ${VPS_HOST}"
    echo "  - SSH credentials are correct"
    echo "  - You have permission to write to ${VPS_PATH}"
    echo ""
    exit 1
fi

