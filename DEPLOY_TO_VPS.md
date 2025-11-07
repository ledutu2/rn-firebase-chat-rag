# Deploy MCP Server to VPS

Complete guide to deploy the RN Firebase Chat MCP Server to your VPS.

## 📋 Server Information

- **VPS IP**: 10.30.10.35
- **Username**: locnguyent
- **Domain**: rn-firebase-chat-mcp.rnbase.online
- **Project Path**: /home/locnguyent/rn-firebase-chat-rag

> **Note**: SSH password is not included in this documentation for security reasons. Use your secure credentials to access the VPS.

## 🚀 Deployment Steps

### Option 1: Quick Deployment (Recommended for First Time)

This runs both setup and deployment in one command:

```bash
# 1. SSH into VPS
ssh locnguyent@10.30.10.35

# 2. Navigate to project
cd /home/locnguyent/rn-firebase-chat-rag

# 3. Run quick deploy (requires sudo)
sudo bash deploy/quick-deploy.sh
```

### Option 2: Manual Step-by-Step Deployment

#### Step 1: Upload Project to VPS

From your local machine:

```bash
# Option A: Using SCP
cd /Users/tungle/saigontechnology
scp -r rn-firebase-chat-rag locnguyent@10.30.10.35:/home/locnguyent/

# Option B: Using rsync (recommended, faster for updates)
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude 'data' \
  rn-firebase-chat-rag/ locnguyent@10.30.10.35:/home/locnguyent/rn-firebase-chat-rag/

# Option C: Using Git (if repository is available)
ssh locnguyent@10.30.10.35
cd /home/locnguyent
git clone <your-repo-url> rn-firebase-chat-rag
```

#### Step 2: Initial VPS Setup (One-time)

```bash
# SSH into VPS
ssh locnguyent@10.30.10.35

# Run setup script as root/sudo
sudo bash /home/locnguyent/rn-firebase-chat-rag/deploy/setup-vps.sh
```

This installs:
- Node.js v20 (LTS)
- Nginx
- Git
- Build essentials
- PM2
- Configures firewall

#### Step 3: Deploy Application

```bash
# Switch to locnguyent user (if not already)
su - locnguyent

# Navigate to project
cd /home/locnguyent/rn-firebase-chat-rag

# Run deployment script
bash deploy/deploy.sh
```

This will:
- Install dependencies
- Build the project
- Setup systemd service
- Configure Nginx
- Start the MCP server

#### Step 4: Verify Deployment

```bash
# Check service status
sudo systemctl status rn-firebase-chat-mcp

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

The deployment script automatically creates a `.env` file with default configuration. The MCP HTTP server uses:

- **MCP_HTTP_PORT**: 4001 (internal port for MCP server)
- **MCP_HTTP_HOST**: 0.0.0.0 (listen on all interfaces)
- **PORT**: 4000 (main API server port)

To customize the configuration:

```bash
# Edit .env file
nano /home/locnguyent/rn-firebase-chat-rag/.env

# Restart service after changes
sudo systemctl restart rn-firebase-chat-mcp
```

## 🔧 Post-Deployment Configuration

### Enable HTTPS (Recommended)

#### Option 1: Using the Setup Script (Easiest)

```bash
# SSH into VPS
ssh locnguyent@10.30.10.35

# Run the HTTPS setup script
sudo bash /home/locnguyent/rn-firebase-chat-rag/deploy/enable-https.sh
```

The script will:
- ✅ Install Certbot if not already installed
- ✅ Obtain SSL certificate from Let's Encrypt
- ✅ Configure Nginx for HTTPS automatically
- ✅ Set up HTTP to HTTPS redirect
- ✅ Test the HTTPS connection
- ✅ Configure auto-renewal

#### Option 2: Manual Setup

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d rn-firebase-chat-mcp.rnbase.online

# Follow the prompts:
# 1. Enter your email
# 2. Agree to terms of service (Y)
# 3. Choose option 2: Redirect HTTP to HTTPS (recommended)
```

#### Verify HTTPS

```bash
# Test HTTPS connection
curl https://rn-firebase-chat-mcp.rnbase.online/health

# Expected response:
# {"status":"ok","service":"rn-firebase-chat-mcp","version":"1.0.0",...}
```

#### Certificate Management

```bash
# Check certificate status
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run

# Manual renewal (if needed)
sudo certbot renew
```

Certbot will automatically:
- Obtain SSL certificate (free from Let's Encrypt)
- Configure Nginx for HTTPS
- Set up auto-renewal (certificates renew every 90 days)

### Verify HTTPS

```bash
curl https://rn-firebase-chat-mcp.rnbase.online/health
```

## 🧪 Testing the API

### 1. Health Check

```bash
curl http://rn-firebase-chat-mcp.rnbase.online/health
```

### 2. Server Info

```bash
curl http://rn-firebase-chat-mcp.rnbase.online/
```

### 3. Retrieve Context

```bash
curl -X POST http://rn-firebase-chat-mcp.rnbase.online/tools/retrieve_context \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How to implement Firebase chat?",
    "limit": 5
  }'
```

### 4. Get Statistics

```bash
curl http://rn-firebase-chat-mcp.rnbase.online/tools/get_stats
```

### 5. Search by Metadata

```bash
curl -X POST http://rn-firebase-chat-mcp.rnbase.online/tools/search_by_metadata \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {"section": "Authentication"},
    "limit": 10
  }'
```

### 6. Get Resources

```bash
# Overview
curl http://rn-firebase-chat-mcp.rnbase.online/resources/overview

# Documents
curl http://rn-firebase-chat-mcp.rnbase.online/resources/documents
```

## 📊 Monitoring & Management

### View Logs

```bash
# Real-time service logs
sudo journalctl -u rn-firebase-chat-mcp -f

# Last 100 lines
sudo journalctl -u rn-firebase-chat-mcp -n 100

# Application logs
tail -f /home/locnguyent/rn-firebase-chat-rag/logs/combined.log
tail -f /home/locnguyent/rn-firebase-chat-rag/logs/error.log

# Nginx logs
sudo tail -f /var/log/nginx/rn-firebase-chat-mcp.access.log
sudo tail -f /var/log/nginx/rn-firebase-chat-mcp.error.log
```

### Service Management

```bash
# Start
sudo systemctl start rn-firebase-chat-mcp

# Stop
sudo systemctl stop rn-firebase-chat-mcp

# Restart
sudo systemctl restart rn-firebase-chat-mcp

# Status
sudo systemctl status rn-firebase-chat-mcp

# Enable auto-start
sudo systemctl enable rn-firebase-chat-mcp
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx
```

## 🔄 Updating the Application

To deploy updates:

```bash
# 1. SSH into VPS
ssh locnguyent@10.30.10.35

# 2. Navigate to project
cd /home/locnguyent/rn-firebase-chat-rag

# 3. Update code (choose one method)

# Option A: Pull from git
git pull origin main

# Option B: Upload from local machine
# From local: rsync -avz --exclude 'node_modules' --exclude 'dist' \
#   rn-firebase-chat-rag/ locnguyent@10.30.10.35:/home/locnguyent/rn-firebase-chat-rag/

# 4. Run deployment script
bash deploy/deploy.sh
```

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
sudo journalctl -u rn-firebase-chat-mcp -n 100

# Check if port is in use
sudo lsof -i :3001

# Verify Node.js
node -v
npm -v

# Check permissions
ls -la /home/locnguyent/rn-firebase-chat-rag
```

### Can't Access via Domain

```bash
# Check DNS
nslookup rn-firebase-chat-mcp.rnbase.online

# Check firewall
sudo ufw status

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check if Nginx is listening
sudo netstat -tlnp | grep :80
```

### Application Errors

```bash
# Check error logs
tail -f /home/locnguyent/rn-firebase-chat-rag/logs/error.log

# Check data directory
ls -la /home/locnguyent/rn-firebase-chat-rag/data/lancedb

# Verify build
ls -la /home/locnguyent/rn-firebase-chat-rag/dist/mcp/

# Reinstall dependencies
cd /home/locnguyent/rn-firebase-chat-rag
rm -rf node_modules
npm install
npm run build
```

## 📁 Important Files & Locations

### Configuration Files

- **Nginx**: `/etc/nginx/sites-available/rn-firebase-chat-mcp`
- **Systemd**: `/etc/systemd/system/rn-firebase-chat-mcp.service`
- **Environment**: `/home/locnguyent/rn-firebase-chat-rag/.env` (optional)

### Data & Logs

- **Vector DB**: `/home/locnguyent/rn-firebase-chat-rag/data/lancedb/`
- **App Logs**: `/home/locnguyent/rn-firebase-chat-rag/logs/`
- **Nginx Logs**: `/var/log/nginx/rn-firebase-chat-mcp.*`
- **System Logs**: `journalctl -u rn-firebase-chat-mcp`

### Deployment Files

- **Setup Script**: `/home/locnguyent/rn-firebase-chat-rag/deploy/setup-vps.sh`
- **Deploy Script**: `/home/locnguyent/rn-firebase-chat-rag/deploy/deploy.sh`
- **Quick Deploy**: `/home/locnguyent/rn-firebase-chat-rag/deploy/quick-deploy.sh`

## 🔐 Security Checklist

- [ ] Firewall configured (UFW)
- [ ] HTTPS enabled (Let's Encrypt)
- [ ] Strong passwords
- [ ] Regular system updates
- [ ] Backup data directory
- [ ] Monitor logs regularly
- [ ] Rate limiting (optional)

## 📞 Quick Reference Commands

```bash
# SSH into VPS
ssh locnguyent@10.30.10.35

# Deploy/Update
cd /home/locnguyent/rn-firebase-chat-rag && bash deploy/deploy.sh

# Restart service
sudo systemctl restart rn-firebase-chat-mcp

# View logs
sudo journalctl -u rn-firebase-chat-mcp -f

# Test health
curl http://rn-firebase-chat-mcp.rnbase.online/health

# Enable HTTPS
sudo certbot --nginx -d rn-firebase-chat-mcp.rnbase.online
```

## 📚 Additional Resources

- **Detailed Guide**: `/home/locnguyent/rn-firebase-chat-rag/deploy/DEPLOYMENT_GUIDE.md`
- **Deploy README**: `/home/locnguyent/rn-firebase-chat-rag/deploy/README.md`
- **Main README**: `/home/locnguyent/rn-firebase-chat-rag/README.md`

## ✅ Deployment Checklist

- [ ] Project uploaded to VPS
- [ ] VPS setup completed (`setup-vps.sh`)
- [ ] DNS configured (rn-firebase-chat-mcp.rnbase.online → 10.30.10.35)
- [ ] Application deployed (`deploy.sh`)
- [ ] Service running (`systemctl status rn-firebase-chat-mcp`)
- [ ] Nginx configured and running
- [ ] Health check passing (HTTP)
- [ ] SSL certificate installed (HTTPS)
- [ ] All API endpoints tested
- [ ] Logs accessible and monitoring setup
- [ ] Auto-restart configured

---

**Need Help?** Check the logs first:
```bash
sudo journalctl -u rn-firebase-chat-mcp -n 100
```

