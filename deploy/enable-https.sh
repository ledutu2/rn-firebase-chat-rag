#!/bin/bash

# Enable HTTPS for RN Firebase Chat MCP Server
# This script installs SSL certificate using Let's Encrypt

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="rn-firebase-chat-mcp.rnbase.online"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔒 Enable HTTPS for MCP Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run with sudo${NC}"
    echo "Usage: sudo bash deploy/enable-https.sh"
    exit 1
fi

echo -e "${YELLOW}📋 Domain: ${DOMAIN}${NC}"
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Certbot...${NC}"
    apt update
    apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}✓ Certbot installed${NC}"
else
    echo -e "${GREEN}✓ Certbot already installed${NC}"
fi

echo ""
echo -e "${YELLOW}🔐 Obtaining SSL certificate...${NC}"
echo ""
echo -e "${BLUE}You will be asked to:${NC}"
echo -e "  1. Enter your email address"
echo -e "  2. Agree to Terms of Service"
echo -e "  3. Choose to redirect HTTP to HTTPS (recommended: option 2)"
echo ""

# Run certbot
certbot --nginx -d "$DOMAIN"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ HTTPS Enabled Successfully!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}🧪 Testing HTTPS...${NC}"
    
    # Wait a moment for Nginx to reload
    sleep 2
    
    # Test HTTPS
    HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/health || echo "000")
    
    if [ "$HTTPS_TEST" = "200" ]; then
        echo -e "${GREEN}✓ HTTPS is working!${NC}"
        echo ""
        echo -e "${YELLOW}📊 Your MCP Server URLs:${NC}"
        echo -e "   HTTP:  http://${DOMAIN}"
        echo -e "   HTTPS: ${GREEN}https://${DOMAIN}${NC} ✓"
        echo ""
        echo -e "${YELLOW}🔄 Auto-renewal:${NC}"
        echo -e "   Certbot will automatically renew your certificate"
        echo -e "   Check renewal: sudo certbot renew --dry-run"
        echo ""
    else
        echo -e "${YELLOW}⚠️  HTTPS configured but test failed (HTTP code: $HTTPS_TEST)${NC}"
        echo -e "   Please check: sudo nginx -t"
        echo -e "   View logs: sudo tail -f /var/log/nginx/error.log"
    fi
    
    echo -e "${YELLOW}📝 Useful Commands:${NC}"
    echo -e "   Check certificate: sudo certbot certificates"
    echo -e "   Renew manually: sudo certbot renew"
    echo -e "   Test renewal: sudo certbot renew --dry-run"
    echo ""
else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Possible issues:${NC}"
    echo -e "  1. Domain not pointing to this server"
    echo -e "     Check: nslookup ${DOMAIN}"
    echo -e "  2. Port 80/443 not open"
    echo -e "     Check: sudo ufw status"
    echo -e "  3. Nginx not running"
    echo -e "     Check: sudo systemctl status nginx"
    echo ""
    exit 1
fi

