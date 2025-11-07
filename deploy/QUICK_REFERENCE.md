# Quick Reference Card

## 🔑 VPS Credentials

```bash
Host: 10.30.10.35
User: locnguyent
Domain: rn-firebase-chat-mcp.rnbase.online
```

> **Note**: Use your secure SSH credentials to access the VPS.

## 🚀 One-Command Deployment

```bash
# SSH into VPS
ssh locnguyent@10.30.10.35

# First time (includes setup)
sudo bash /home/locnguyent/rn-firebase-chat-rag/deploy/quick-deploy.sh

# Updates only
cd /home/locnguyent/rn-firebase-chat-rag && bash deploy/deploy.sh
```

## 🧪 Quick Tests

```bash
# Health check
curl http://rn-firebase-chat-mcp.rnbase.online/health

# Server info
curl http://rn-firebase-chat-mcp.rnbase.online/

# Retrieve context
curl -X POST http://rn-firebase-chat-mcp.rnbase.online/tools/retrieve_context \
  -H "Content-Type: application/json" \
  -d '{"question": "How to implement Firebase chat?", "limit": 5}'

# Get stats
curl http://rn-firebase-chat-mcp.rnbase.online/tools/get_stats
```

## 📊 Service Management

```bash
# Status
sudo systemctl status rn-firebase-chat-mcp

# Start/Stop/Restart
sudo systemctl start rn-firebase-chat-mcp
sudo systemctl stop rn-firebase-chat-mcp
sudo systemctl restart rn-firebase-chat-mcp

# Enable/Disable auto-start
sudo systemctl enable rn-firebase-chat-mcp
sudo systemctl disable rn-firebase-chat-mcp
```

## 📝 View Logs

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

## 🌐 Nginx Management

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx
```

## 🔒 Enable HTTPS

```bash
# Install certbot (one time)
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d rn-firebase-chat-mcp.rnbase.online

# Test HTTPS
curl https://rn-firebase-chat-mcp.rnbase.online/health
```

## 🔄 Update Deployment

```bash
# Method 1: Using git
ssh locnguyent@10.30.10.35
cd /home/locnguyent/rn-firebase-chat-rag
git pull origin main
bash deploy/deploy.sh

# Method 2: Upload from local
# From local machine:
rsync -avz --exclude 'node_modules' --exclude 'dist' \
  rn-firebase-chat-rag/ locnguyent@10.30.10.35:/home/locnguyent/rn-firebase-chat-rag/
# Then SSH and run:
ssh locnguyent@10.30.10.35
cd /home/locnguyent/rn-firebase-chat-rag
bash deploy/deploy.sh
```

## 🐛 Troubleshooting

```bash
# Service won't start
sudo journalctl -u rn-firebase-chat-mcp -n 100
sudo lsof -i :3001

# Can't access domain
nslookup rn-firebase-chat-mcp.rnbase.online
sudo ufw status
sudo nginx -t

# Application errors
tail -f /home/locnguyent/rn-firebase-chat-rag/logs/error.log
ls -la /home/locnguyent/rn-firebase-chat-rag/data/lancedb

# Rebuild
cd /home/locnguyent/rn-firebase-chat-rag
rm -rf node_modules dist
npm install
npm run build
sudo systemctl restart rn-firebase-chat-mcp
```

## 📂 Important Paths

```bash
# Project
/home/locnguyent/rn-firebase-chat-rag

# Nginx config
/etc/nginx/sites-available/rn-firebase-chat-mcp

# Systemd service
/etc/systemd/system/rn-firebase-chat-mcp.service

# Data
/home/locnguyent/rn-firebase-chat-rag/data/lancedb

# Logs
/home/locnguyent/rn-firebase-chat-rag/logs
/var/log/nginx/rn-firebase-chat-mcp.*
```

## 🔢 Ports

- **3001**: Internal MCP HTTP server (configured in .env via MCP_HTTP_PORT)
- **4000**: Main API server (configured in .env via PORT)
- **80**: External HTTP (Nginx)
- **443**: External HTTPS (Nginx, after SSL)
- **22**: SSH

## ⚙️ Configuration

Configuration is managed via `.env` file at `/home/locnguyent/rn-firebase-chat-rag/.env`

Key settings:
- `MCP_HTTP_PORT=3001` - MCP server port
- `MCP_HTTP_HOST=0.0.0.0` - MCP server host
- `PORT=4000` - Main API server port
- `HOST=10.30.10.35` - Server host

After editing `.env`, restart the service:
```bash
sudo systemctl restart rn-firebase-chat-mcp
```

## 📚 Documentation

- **Main Guide**: `DEPLOY_TO_VPS.md`
- **Detailed Guide**: `deploy/DEPLOYMENT_GUIDE.md`
- **Summary**: `deploy/DEPLOYMENT_SUMMARY.md`
- **This File**: `deploy/QUICK_REFERENCE.md`

## 🎯 Common Tasks

### Check if everything is working
```bash
curl http://rn-firebase-chat-mcp.rnbase.online/health
sudo systemctl status rn-firebase-chat-mcp
sudo systemctl status nginx
```

### Restart everything
```bash
sudo systemctl restart rn-firebase-chat-mcp
sudo systemctl restart nginx
```

### View all logs
```bash
sudo journalctl -u rn-firebase-chat-mcp -f
```

### Full redeploy
```bash
cd /home/locnguyent/rn-firebase-chat-rag
bash deploy/deploy.sh
```

---

**Need more details?** See `DEPLOY_TO_VPS.md` or `deploy/DEPLOYMENT_GUIDE.md`

