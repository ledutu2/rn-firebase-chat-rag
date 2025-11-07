# Deployment Guide - RN Firebase Chat MCP Server

This guide will help you deploy the MCP server to your VPS with Nginx reverse proxy.

## 📋 Prerequisites

- VPS with Ubuntu/Debian (tested on Ubuntu 20.04+)
- Domain name: `rn-firebase-chat-mcp.rnbase.online` pointing to your VPS IP
- SSH access to VPS
- User account: `locnguyent`

## 🚀 Quick Start

### Step 1: Initial VPS Setup (One-time)

SSH into your VPS as root or with sudo privileges:

```bash
ssh locnguyent@10.30.10.35
```

Run the initial setup script to install all dependencies:

```bash
# If you have sudo access
sudo bash /home/locnguyent/rn-firebase-chat-rag/deploy/setup-vps.sh

# Or as root
su -
bash /home/locnguyent/rn-firebase-chat-rag/deploy/setup-vps.sh
```

This script will install:
- Node.js (v20 LTS)
- Nginx
- Git
- Build essentials
- PM2 (optional)
- Configure firewall (UFW)

### Step 2: Deploy the Application

Switch to the `locnguyent` user and run the deployment script:

```bash
su - locnguyent
cd /home/locnguyent/rn-firebase-chat-rag
bash deploy/deploy.sh
```

The deployment script will:
1. Pull latest changes from git (if applicable)
2. Install npm dependencies
3. Build the TypeScript project
4. Create necessary directories
5. Setup systemd service
6. Configure Nginx reverse proxy
7. Start the MCP server
8. Run health checks

### Step 3: Verify Deployment

Check if the service is running:

```bash
# Check service status
sudo systemctl status rn-firebase-chat-mcp

# Check logs
sudo journalctl -u rn-firebase-chat-mcp -f

# Test locally
curl http://localhost:3001/health

# Test via domain
curl http://rn-firebase-chat-mcp.rnbase.online/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "rn-firebase-chat-mcp",
  "version": "1.0.0",
  "timestamp": "2025-11-07T..."
}
```

## 🔧 Configuration

### Environment Variables

The `.env` file is automatically created during deployment with the following configuration:

```env
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
```

You can customize these values by editing `/home/locnguyent/rn-firebase-chat-rag/.env` after deployment.

### Systemd Service

The service file is located at: `/etc/systemd/system/rn-firebase-chat-mcp.service`

Key configurations:
- **User**: locnguyent
- **WorkingDirectory**: /home/locnguyent/rn-firebase-chat-rag
- **Environment File**: `/home/locnguyent/rn-firebase-chat-rag/.env`
- **Port**: 3001 (configured via MCP_HTTP_PORT in .env)
- **Auto-restart**: Yes

The service reads all configuration from the `.env` file, making it easy to update settings without modifying the service file.

### Nginx Configuration

The Nginx config is located at: `/etc/nginx/sites-available/rn-firebase-chat-mcp`

Key configurations:
- **Domain**: rn-firebase-chat-mcp.rnbase.online
- **Port**: 80 (HTTP), 443 (HTTPS - after SSL setup)
- **Proxy**: http://127.0.0.1:3001

## 🔒 Enable HTTPS (Recommended)

After basic deployment, enable HTTPS with Let's Encrypt:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d rn-firebase-chat-mcp.rnbase.online

# Follow the prompts to:
# 1. Enter your email
# 2. Agree to terms
# 3. Choose to redirect HTTP to HTTPS (recommended)
```

Certbot will automatically:
- Obtain SSL certificate
- Configure Nginx for HTTPS
- Set up auto-renewal

To manually enable HTTPS configuration:

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/rn-firebase-chat-mcp

# Uncomment the HTTPS server block (lines starting with #)
# Save and exit (Ctrl+X, Y, Enter)

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 📊 Monitoring & Maintenance

### View Logs

```bash
# Application logs (systemd)
sudo journalctl -u rn-firebase-chat-mcp -f

# Application logs (file)
tail -f /home/locnguyent/rn-firebase-chat-rag/logs/combined.log
tail -f /home/locnguyent/rn-firebase-chat-rag/logs/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/rn-firebase-chat-mcp.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/rn-firebase-chat-mcp.error.log
```

### Service Management

```bash
# Start service
sudo systemctl start rn-firebase-chat-mcp

# Stop service
sudo systemctl stop rn-firebase-chat-mcp

# Restart service
sudo systemctl restart rn-firebase-chat-mcp

# Check status
sudo systemctl status rn-firebase-chat-mcp

# Enable auto-start on boot
sudo systemctl enable rn-firebase-chat-mcp

# Disable auto-start
sudo systemctl disable rn-firebase-chat-mcp
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

## 🔄 Updating the Application

To deploy updates:

```bash
# SSH into VPS
ssh locnguyent@10.30.10.35

# Navigate to project
cd /home/locnguyent/rn-firebase-chat-rag

# Pull latest changes (if using git)
git pull origin main

# Run deployment script
bash deploy/deploy.sh
```

The script will automatically:
- Install new dependencies
- Rebuild the project
- Restart the service

## 🧪 Testing the API

### Health Check

```bash
curl http://rn-firebase-chat-mcp.rnbase.online/health
```

### Get Server Info

```bash
curl http://rn-firebase-chat-mcp.rnbase.online/
```

### Retrieve Context (MCP Tool)

```bash
curl -X POST http://rn-firebase-chat-mcp.rnbase.online/tools/retrieve_context \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How to implement Firebase chat?",
    "limit": 5
  }'
```

### Get Stats

```bash
curl http://rn-firebase-chat-mcp.rnbase.online/tools/get_stats
```

### Search by Metadata

```bash
curl -X POST http://rn-firebase-chat-mcp.rnbase.online/tools/search_by_metadata \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {"section": "Authentication"},
    "limit": 10
  }'
```

## 🐛 Troubleshooting

### Service won't start

```bash
# Check logs
sudo journalctl -u rn-firebase-chat-mcp -n 100

# Check if port is already in use
sudo lsof -i :3001

# Verify Node.js is installed
node -v
npm -v
```

### Nginx errors

```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Check if Nginx is running
sudo systemctl status nginx
```

### Can't access via domain

1. Verify DNS is pointing to VPS IP:
   ```bash
   nslookup rn-firebase-chat-mcp.rnbase.online
   ```

2. Check firewall:
   ```bash
   sudo ufw status
   ```

3. Verify Nginx is listening:
   ```bash
   sudo netstat -tlnp | grep :80
   ```

### Application errors

```bash
# Check application logs
tail -f /home/locnguyent/rn-firebase-chat-rag/logs/error.log

# Check if data directory exists
ls -la /home/locnguyent/rn-firebase-chat-rag/data/lancedb

# Verify permissions
ls -la /home/locnguyent/rn-firebase-chat-rag
```

## 📁 Project Structure

```
/home/locnguyent/rn-firebase-chat-rag/
├── deploy/                      # Deployment files
│   ├── deploy.sh               # Main deployment script
│   ├── setup-vps.sh            # Initial VPS setup
│   ├── nginx.conf              # Nginx configuration
│   ├── rn-firebase-chat-mcp.service  # Systemd service
│   └── DEPLOYMENT_GUIDE.md     # This file
├── src/                        # Source code
│   ├── mcp/
│   │   ├── server.ts          # MCP stdio server
│   │   └── http-server.ts     # MCP HTTP server (deployed)
│   └── rag/                   # RAG pipeline
├── dist/                       # Compiled JavaScript
├── data/                       # LanceDB data
├── logs/                       # Application logs
├── docs/                       # Documentation
└── package.json               # Dependencies
```

## 🔐 Security Considerations

1. **Firewall**: Only allow necessary ports (22, 80, 443)
2. **HTTPS**: Always use HTTPS in production
3. **Updates**: Keep system and packages updated
4. **Backups**: Regularly backup the `data/` directory
5. **Monitoring**: Set up monitoring and alerts
6. **Rate Limiting**: Consider adding rate limiting in Nginx

## 📞 Support

For issues or questions:
- Check logs: `sudo journalctl -u rn-firebase-chat-mcp -f`
- Review this guide
- Check the main README.md

## 📝 Notes

- The MCP server runs on port 3001 internally
- Nginx proxies external traffic (port 80/443) to port 3001
- The service auto-restarts on failure
- Logs are stored in both systemd journal and `/home/locnguyent/rn-firebase-chat-rag/logs/`
- SSL certificates auto-renew via certbot

## ✅ Deployment Checklist

- [ ] VPS setup completed (`setup-vps.sh`)
- [ ] DNS pointing to VPS IP
- [ ] Project deployed (`deploy.sh`)
- [ ] Service running and healthy
- [ ] Nginx configured and running
- [ ] Domain accessible via HTTP
- [ ] SSL certificate installed (optional but recommended)
- [ ] HTTPS working (if SSL enabled)
- [ ] Health check passing
- [ ] API endpoints tested
- [ ] Logs accessible
- [ ] Auto-restart configured

