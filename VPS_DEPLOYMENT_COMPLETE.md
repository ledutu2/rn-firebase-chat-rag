# ✅ VPS Deployment Setup Complete

All deployment files and configurations have been created successfully!

## 🎉 What's Ready

### 1. HTTP Server for MCP
- **File**: `src/mcp/http-server.ts`
- **Purpose**: Exposes MCP functionality as REST API
- **Port**: 4001 (internal)
- **Features**: Health checks, all MCP tools and resources as HTTP endpoints

### 2. Deployment Scripts
- ✅ `deploy/setup-vps.sh` - Initial VPS setup (Node.js, Nginx, etc.)
- ✅ `deploy/deploy.sh` - Main deployment script
- ✅ `deploy/quick-deploy.sh` - One-command deployment
- ✅ `deploy/upload-to-vps.sh` - Upload project from local machine

### 3. Configuration Files
- ✅ `deploy/nginx.conf` - Nginx reverse proxy config
- ✅ `deploy/rn-firebase-chat-mcp.service` - Systemd service

### 4. Documentation
- ✅ `DEPLOY_TO_VPS.md` - Main deployment guide
- ✅ `deploy/DEPLOYMENT_GUIDE.md` - Comprehensive guide
- ✅ `deploy/DEPLOYMENT_SUMMARY.md` - Technical summary
- ✅ `deploy/QUICK_REFERENCE.md` - Quick command reference
- ✅ `deploy/README.md` - Deploy directory overview

### 5. Project Updates
- ✅ Updated `package.json` with new scripts
- ✅ Built and tested - no errors
- ✅ All scripts are executable

## 🚀 How to Deploy

### Step 1: Upload Project to VPS

**Option A: Using the upload script (Recommended)**
```bash
# From your local machine (in project root)
./deploy/upload-to-vps.sh
```

**Option B: Manual upload**
```bash
# Using rsync
rsync -avz --exclude 'node_modules' --exclude 'dist' \
  rn-firebase-chat-rag/ locnguyent@10.30.10.35:/home/locnguyent/rn-firebase-chat-rag/

# Or using SCP
scp -r rn-firebase-chat-rag locnguyent@10.30.10.35:/home/locnguyent/
```

### Step 2: Deploy on VPS

**Option A: Quick deploy (First time - includes setup)**
```bash
ssh locnguyent@10.30.10.35

sudo bash /home/locnguyent/rn-firebase-chat-rag/deploy/quick-deploy.sh
```

**Option B: Manual deployment**
```bash
ssh locnguyent@10.30.10.35

# First time only - run setup
sudo bash /home/locnguyent/rn-firebase-chat-rag/deploy/setup-vps.sh

# Then deploy
cd /home/locnguyent/rn-firebase-chat-rag
bash deploy/deploy.sh
```

### Step 3: Verify

```bash
# Check service
sudo systemctl status rn-firebase-chat-mcp

# Test health endpoint
curl http://rn-firebase-chat-mcp.rnbase.online/health

# Expected response:
# {"status":"ok","service":"rn-firebase-chat-mcp","version":"1.0.0","timestamp":"..."}
```

## 🧪 Test the API

### Health Check
```bash
curl http://rn-firebase-chat-mcp.rnbase.online/health
```

### Server Info
```bash
curl http://rn-firebase-chat-mcp.rnbase.online/
```

### Retrieve Context (Main Feature)
```bash
curl -X POST http://rn-firebase-chat-mcp.rnbase.online/tools/retrieve_context \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How to implement Firebase chat?",
    "limit": 5
  }'
```

### Get Statistics
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

### Get Resources
```bash
# Overview
curl http://rn-firebase-chat-mcp.rnbase.online/resources/overview

# Documents
curl http://rn-firebase-chat-mcp.rnbase.online/resources/documents
```

## 📊 Architecture

```
┌─────────────────────────────────────────────┐
│  Internet / Users                           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Domain: rn-firebase-chat-mcp.rnbase.online │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Nginx (Port 80/443)                        │
│  - Reverse Proxy                            │
│  - SSL/TLS (after certbot)                  │
│  - Security Headers                         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  MCP HTTP Server (Port 4001)                │
│  - Express.js                               │
│  - CORS enabled                             │
│  - REST API endpoints                       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  RAG Pipeline                               │
│  - LanceDB (Vector Store)                   │
│  - Embeddings (Xenova/bge-base-en-v1.5)     │
│  - Document Retrieval                       │
└─────────────────────────────────────────────┘
```

## 🔐 Security Features

1. **Firewall (UFW)** - Only necessary ports open
2. **Nginx Security Headers** - XSS, CSRF protection
3. **HTTPS Support** - Let's Encrypt integration
4. **Systemd Hardening** - Limited permissions
5. **CORS Configuration** - Controlled access

## ⚙️ Configuration

All configuration is managed via the `.env` file at `/home/locnguyent/rn-firebase-chat-rag/.env`

Key settings:
- `MCP_HTTP_PORT=4001` - MCP server port
- `MCP_HTTP_HOST=0.0.0.0` - MCP server host
- `PORT=4000` - Main API server port
- `HOST=10.30.10.35` - Server host

To change configuration:
```bash
# Edit .env file
nano /home/locnguyent/rn-firebase-chat-rag/.env

# Restart service to apply changes
sudo systemctl restart rn-firebase-chat-mcp
```

## 📝 Management Commands

### Service Management
```bash
# Status
sudo systemctl status rn-firebase-chat-mcp

# Start/Stop/Restart
sudo systemctl start rn-firebase-chat-mcp
sudo systemctl stop rn-firebase-chat-mcp
sudo systemctl restart rn-firebase-chat-mcp
```

### View Logs
```bash
# Real-time logs
sudo journalctl -u rn-firebase-chat-mcp -f

# Last 100 lines
sudo journalctl -u rn-firebase-chat-mcp -n 100

# Application logs
tail -f /home/locnguyent/rn-firebase-chat-rag/logs/combined.log
```

### Update Deployment
```bash
# Upload new code from local
./deploy/upload-to-vps.sh

# Or pull from git on VPS
ssh locnguyent@10.30.10.35
cd /home/locnguyent/rn-firebase-chat-rag
git pull origin main

# Deploy
bash deploy/deploy.sh
```

## 🔒 Enable HTTPS (Recommended)

After basic deployment:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d rn-firebase-chat-mcp.rnbase.online

# Test HTTPS
curl https://rn-firebase-chat-mcp.rnbase.online/health
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `DEPLOY_TO_VPS.md` | Main deployment guide (start here) |
| `deploy/DEPLOYMENT_GUIDE.md` | Comprehensive deployment guide |
| `deploy/DEPLOYMENT_SUMMARY.md` | Technical summary |
| `deploy/QUICK_REFERENCE.md` | Quick command reference |
| `deploy/README.md` | Deploy directory overview |
| `VPS_DEPLOYMENT_COMPLETE.md` | This file - overview |

## 🎯 Quick Reference

### VPS Details
- **Host**: 10.30.10.35
- **User**: locnguyent
- **Domain**: rn-firebase-chat-mcp.rnbase.online

> **Security Note**: SSH credentials should be kept secure and not stored in documentation.

### Paths
- **Project**: `/home/locnguyent/rn-firebase-chat-rag`
- **Nginx Config**: `/etc/nginx/sites-available/rn-firebase-chat-mcp`
- **Service**: `/etc/systemd/system/rn-firebase-chat-mcp.service`

### Ports
- **4000**: Main API server
- **4001**: MCP HTTP server
- **80**: External HTTP
- **443**: External HTTPS (after SSL)

### Key Commands
```bash
# Upload
./deploy/upload-to-vps.sh

# Deploy
ssh locnguyent@10.30.10.35
sudo bash /home/locnguyent/rn-firebase-chat-rag/deploy/quick-deploy.sh

# Test
curl http://rn-firebase-chat-mcp.rnbase.online/health

# Logs
sudo journalctl -u rn-firebase-chat-mcp -f

# Restart
sudo systemctl restart rn-firebase-chat-mcp
```

## ✅ Deployment Checklist

- [ ] Project uploaded to VPS
- [ ] Initial setup completed (`setup-vps.sh`)
- [ ] DNS configured (domain → VPS IP)
- [ ] Application deployed (`deploy.sh`)
- [ ] Service running and healthy
- [ ] Nginx configured
- [ ] Domain accessible via HTTP
- [ ] API endpoints tested
- [ ] SSL certificate installed (optional but recommended)
- [ ] HTTPS working (if SSL enabled)
- [ ] Monitoring setup

## 🐛 Troubleshooting

### Service won't start
```bash
sudo journalctl -u rn-firebase-chat-mcp -n 100
sudo lsof -i :4001
```

### Can't access domain
```bash
nslookup rn-firebase-chat-mcp.rnbase.online
sudo ufw status
sudo nginx -t
```

### Application errors
```bash
tail -f /home/locnguyent/rn-firebase-chat-rag/logs/error.log
ls -la /home/locnguyent/rn-firebase-chat-rag/data/lancedb
```

## 🎉 Next Steps

1. **Upload Project**
   ```bash
   ./deploy/upload-to-vps.sh
   ```

2. **Deploy to VPS**
   ```bash
   ssh locnguyent@10.30.10.35
   sudo bash /home/locnguyent/rn-firebase-chat-rag/deploy/quick-deploy.sh
   ```

3. **Verify**
   ```bash
   curl http://rn-firebase-chat-mcp.rnbase.online/health
   ```

4. **Enable HTTPS**
   ```bash
   # Easy way - using setup script
   sudo bash /home/locnguyent/rn-firebase-chat-rag/deploy/enable-https.sh
   
   # Or manual way
   sudo certbot --nginx -d rn-firebase-chat-mcp.rnbase.online
   ```

5. **Monitor**
   ```bash
   sudo journalctl -u rn-firebase-chat-mcp -f
   ```

---

## 📞 Need Help?

1. Check the logs: `sudo journalctl -u rn-firebase-chat-mcp -f`
2. Review documentation: `DEPLOY_TO_VPS.md`
3. Quick reference: `deploy/QUICK_REFERENCE.md`
4. Comprehensive guide: `deploy/DEPLOYMENT_GUIDE.md`

---

**Everything is ready for deployment! 🚀**

Start with: `./deploy/upload-to-vps.sh`

