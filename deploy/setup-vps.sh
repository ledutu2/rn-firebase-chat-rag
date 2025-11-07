#!/bin/bash

# Initial VPS setup script
# Run this script first on a fresh VPS to install dependencies

set -e

echo "🔧 Setting up VPS for RN Firebase Chat MCP Server..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}✓ System updated${NC}"

# Install Node.js (using NodeSource repository for latest LTS)
echo -e "${YELLOW}📦 Installing Node.js...${NC}"

# Check if Node.js is already installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js is already installed: ${NODE_VERSION}${NC}"
else
    # Install Node.js 20.x (LTS)
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✓ Node.js installed: $(node -v)${NC}"
fi

# Install Nginx
echo -e "${YELLOW}📦 Installing Nginx...${NC}"
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}✓ Nginx is already installed${NC}"
else
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    echo -e "${GREEN}✓ Nginx installed and started${NC}"
fi

# Install Git
echo -e "${YELLOW}📦 Installing Git...${NC}"
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓ Git is already installed${NC}"
else
    apt install -y git
    echo -e "${GREEN}✓ Git installed${NC}"
fi

# Install build essentials (required for some npm packages)
echo -e "${YELLOW}📦 Installing build essentials...${NC}"
apt install -y build-essential python3 python3-pip

echo -e "${GREEN}✓ Build essentials installed${NC}"

# Configure firewall (UFW)
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    echo "y" | ufw enable || true
    echo -e "${GREEN}✓ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠️  UFW not installed, skipping firewall configuration${NC}"
fi

# Create project directory if it doesn't exist
PROJECT_DIR="/home/locnguyent/rn-firebase-chat-rag"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}📁 Creating project directory...${NC}"
    mkdir -p "$PROJECT_DIR"
    chown -R locnguyent:locnguyent "$PROJECT_DIR"
    echo -e "${GREEN}✓ Project directory created${NC}"
else
    echo -e "${GREEN}✓ Project directory already exists${NC}"
fi

# Install PM2 globally (alternative to systemd)
echo -e "${YELLOW}📦 Installing PM2 (optional process manager)...${NC}"
npm install -g pm2
echo -e "${GREEN}✓ PM2 installed${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ VPS setup completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "   1. Clone or upload your project to: ${PROJECT_DIR}"
echo -e "   2. Switch to user 'locnguyent': su - locnguyent"
echo -e "   3. Navigate to project: cd ${PROJECT_DIR}"
echo -e "   4. Run deployment script: bash deploy/deploy.sh"
echo ""
echo -e "${YELLOW}📊 Installed versions:${NC}"
echo -e "   Node.js: $(node -v)"
echo -e "   npm: $(npm -v)"
echo -e "   Nginx: $(nginx -v 2>&1 | grep -o 'nginx/[0-9.]*')"
echo -e "   Git: $(git --version | grep -o '[0-9.]*')"
echo ""

