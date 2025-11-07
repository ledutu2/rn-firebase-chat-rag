#!/bin/bash

# Deploy script for React Native Firebase Chat MCP Server
# This script should be run on the VPS

set -e  # Exit on error

echo "🚀 Starting deployment of RN Firebase Chat MCP Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/locnguyent/rn-firebase-chat-rag"
SERVICE_NAME="rn-firebase-chat-mcp"
NGINX_SITE="rn-firebase-chat-mcp"
DOMAIN="rn-firebase-chat-mcp.rnbase.online"

echo -e "${YELLOW}📂 Project directory: ${PROJECT_DIR}${NC}"

# Check if running as correct user
if [ "$USER" != "locnguyent" ]; then
    echo -e "${RED}❌ This script should be run as user 'locnguyent'${NC}"
    echo "Please run: su - locnguyent"
    exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR"

echo -e "${GREEN}✓ Changed to project directory${NC}"

# Pull latest changes from git (optional)
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Pulling latest changes from git...${NC}"
    git pull origin main || echo -e "${YELLOW}⚠️  Git pull failed or not needed${NC}"
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production=false

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Build the project
echo -e "${YELLOW}🔨 Building project...${NC}"
npm run build

echo -e "${GREEN}✓ Project built successfully${NC}"

# Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p "$PROJECT_DIR/data/lancedb"
mkdir -p "$PROJECT_DIR/logs"

echo -e "${GREEN}✓ Directories created${NC}"

# Check if .env file exists, if not create from example
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}⚙️  Creating .env file...${NC}"
    cat > "$PROJECT_DIR/.env" << 'EOF'
# Server Configuration
PORT=4000
NODE_ENV=production

# MCP HTTP Server Configuration
MCP_HTTP_PORT=3001
MCP_HTTP_HOST=0.0.0.0

# Model Configuration
MODEL=llama3
OLLAMA_BASE_URL=http://localhost:11434
PROTOCOL=http
HOST=10.30.10.35

# Embedding Model Configuration
EMBEDDING_MODEL=Xenova/bge-base-en-v1.5

# Vector Database Configuration
LANCEDB_PATH=./data/lancedb
VECTOR_DIMENSION=768

# RAG Configuration
TOP_K_RESULTS=5
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Logging
LOG_LEVEL=info
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Setup systemd service (requires sudo)
echo -e "${YELLOW}⚙️  Setting up systemd service...${NC}"
sudo cp "$PROJECT_DIR/deploy/${SERVICE_NAME}.service" "/etc/systemd/system/${SERVICE_NAME}.service"
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"

echo -e "${GREEN}✓ Systemd service configured${NC}"

# Setup Nginx (requires sudo)
echo -e "${YELLOW}🌐 Setting up Nginx...${NC}"

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx is not installed${NC}"
    echo "Please install Nginx first: sudo apt install nginx"
    exit 1
fi

# Copy Nginx configuration
sudo cp "$PROJECT_DIR/deploy/nginx.conf" "/etc/nginx/sites-available/${NGINX_SITE}"

# Create symlink if it doesn't exist
if [ ! -L "/etc/nginx/sites-enabled/${NGINX_SITE}" ]; then
    sudo ln -s "/etc/nginx/sites-available/${NGINX_SITE}" "/etc/nginx/sites-enabled/${NGINX_SITE}"
fi

# Test Nginx configuration
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
fi

# Restart the service
echo -e "${YELLOW}🔄 Restarting MCP service...${NC}"
sudo systemctl restart "$SERVICE_NAME"

# Wait a moment for service to start
sleep 3

# Check service status
if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
    echo -e "${GREEN}✓ MCP service is running${NC}"
else
    echo -e "${RED}❌ MCP service failed to start${NC}"
    echo "Check logs with: sudo journalctl -u ${SERVICE_NAME} -n 50"
    exit 1
fi

# Test the service
echo -e "${YELLOW}🧪 Testing the service...${NC}"
sleep 2

HEALTH_CHECK=$(curl -s http://localhost:3001/health || echo "failed")

if [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Response: $HEALTH_CHECK"
fi

# Display service status
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📊 Service Information:${NC}"
echo -e "   Service Status: ${GREEN}$(sudo systemctl is-active ${SERVICE_NAME})${NC}"
echo -e "   Local URL: http://localhost:3001"
echo -e "   Public URL: http://${DOMAIN}"
echo ""
echo -e "${YELLOW}📝 Useful Commands:${NC}"
echo -e "   View logs:        sudo journalctl -u ${SERVICE_NAME} -f"
echo -e "   Restart service:  sudo systemctl restart ${SERVICE_NAME}"
echo -e "   Stop service:     sudo systemctl stop ${SERVICE_NAME}"
echo -e "   Service status:   sudo systemctl status ${SERVICE_NAME}"
echo -e "   Nginx logs:       sudo tail -f /var/log/nginx/rn-firebase-chat-mcp.access.log"
echo ""
echo -e "${YELLOW}🔒 To enable HTTPS with Let's Encrypt:${NC}"
echo -e "   1. Install certbot: sudo apt install certbot python3-certbot-nginx"
echo -e "   2. Get certificate: sudo certbot --nginx -d ${DOMAIN}"
echo -e "   3. Uncomment HTTPS section in /etc/nginx/sites-available/${NGINX_SITE}"
echo -e "   4. Reload nginx: sudo systemctl reload nginx"
echo ""

