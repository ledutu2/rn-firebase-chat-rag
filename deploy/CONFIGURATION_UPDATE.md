# Configuration Update Summary

## ✅ Changes Made

Updated the deployment configuration to use centralized `.env` file for all environment variables, making configuration management easier and more consistent.

## 📝 Files Updated

### 1. `.env` (Project Root)
**Added MCP HTTP Server configuration:**
```env
# MCP HTTP Server Configuration
MCP_HTTP_PORT=3001
MCP_HTTP_HOST=0.0.0.0
```

### 2. `deploy/rn-firebase-chat-mcp.service`
**Changed from hardcoded environment variables to `.env` file:**

**Before:**
```ini
Environment="NODE_ENV=production"
Environment="MCP_HTTP_PORT=3001"
Environment="MCP_HTTP_HOST=0.0.0.0"
```

**After:**
```ini
EnvironmentFile=/home/locnguyent/rn-firebase-chat-rag/.env
```

**Benefits:**
- All configuration in one place
- Easy to update without modifying service file
- No need to reload systemd after config changes (just restart service)

### 3. `deploy/deploy.sh`
**Added automatic `.env` file creation:**
- Checks if `.env` exists on VPS
- Creates it with default values if missing
- Preserves existing `.env` if already present

### 4. Documentation Updates

Updated all deployment documentation to reflect the new configuration approach:

- **`DEPLOY_TO_VPS.md`** - Added configuration section
- **`deploy/DEPLOYMENT_GUIDE.md`** - Updated environment variables section
- **`deploy/DEPLOYMENT_SUMMARY.md`** - Updated systemd service description
- **`deploy/QUICK_REFERENCE.md`** - Added configuration section with all ports
- **`VPS_DEPLOYMENT_COMPLETE.md`** - Added configuration management section

## 🎯 Benefits

### 1. **Centralized Configuration**
All environment variables in one `.env` file:
- Server ports (PORT, MCP_HTTP_PORT)
- Host configuration
- Model settings
- Database paths
- RAG parameters

### 2. **Easier Updates**
To change any configuration:
```bash
# Edit .env
nano /home/locnguyent/rn-firebase-chat-rag/.env

# Restart service
sudo systemctl restart rn-firebase-chat-mcp
```

No need to:
- Edit systemd service file
- Run `systemctl daemon-reload`
- Remember multiple configuration locations

### 3. **Automatic Setup**
The deployment script automatically creates `.env` if missing, ensuring consistent configuration across deployments.

### 4. **Port Flexibility**
Easy to change ports without modifying:
- Service files
- Nginx configuration (still needs manual update)
- Application code

## 📊 Configuration Overview

### Port Configuration

| Service | Port | Environment Variable | Location |
|---------|------|---------------------|----------|
| Main API Server | 4000 | `PORT` | `.env` |
| MCP HTTP Server | 3001 | `MCP_HTTP_PORT` | `.env` |
| Nginx HTTP | 80 | N/A | `nginx.conf` |
| Nginx HTTPS | 443 | N/A | `nginx.conf` |

### Configuration Files

| File | Purpose | Managed By |
|------|---------|------------|
| `.env` | All environment variables | User/Deploy script |
| `deploy/rn-firebase-chat-mcp.service` | Systemd service definition | Deploy script |
| `deploy/nginx.conf` | Nginx reverse proxy | Deploy script |

## 🔄 Migration Guide

If you have an existing deployment:

### Step 1: Update `.env` file
```bash
ssh locnguyent@10.30.10.35
cd /home/locnguyent/rn-firebase-chat-rag

# Add MCP configuration to .env
cat >> .env << 'EOF'

# MCP HTTP Server Configuration
MCP_HTTP_PORT=3001
MCP_HTTP_HOST=0.0.0.0
EOF
```

### Step 2: Update systemd service
```bash
# Pull latest changes
git pull origin main

# Copy updated service file
sudo cp deploy/rn-firebase-chat-mcp.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Restart service
sudo systemctl restart rn-firebase-chat-mcp
```

### Step 3: Verify
```bash
# Check service status
sudo systemctl status rn-firebase-chat-mcp

# Test health endpoint
curl http://localhost:3001/health
```

## 📚 Configuration Reference

### Complete `.env` File

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

## 🔧 Common Configuration Changes

### Change MCP Server Port

```bash
# Edit .env
nano /home/locnguyent/rn-firebase-chat-rag/.env

# Change MCP_HTTP_PORT=3001 to desired port
# For example: MCP_HTTP_PORT=3002

# Update Nginx configuration to match
sudo nano /etc/nginx/sites-available/rn-firebase-chat-mcp
# Change proxy_pass http://127.0.0.1:3001 to new port

# Test Nginx config
sudo nginx -t

# Restart both services
sudo systemctl restart rn-firebase-chat-mcp
sudo systemctl reload nginx
```

### Change Log Level

```bash
# Edit .env
nano /home/locnguyent/rn-firebase-chat-rag/.env

# Change LOG_LEVEL=info to debug, warn, or error
# For example: LOG_LEVEL=debug

# Restart service
sudo systemctl restart rn-firebase-chat-mcp
```

### Change Embedding Model

```bash
# Edit .env
nano /home/locnguyent/rn-firebase-chat-rag/.env

# Change EMBEDDING_MODEL to desired model
# For example: EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2

# Restart service
sudo systemctl restart rn-firebase-chat-mcp
```

## ✅ Verification Checklist

After configuration changes:

- [ ] `.env` file updated with correct values
- [ ] Service restarted: `sudo systemctl restart rn-firebase-chat-mcp`
- [ ] Service is active: `sudo systemctl status rn-firebase-chat-mcp`
- [ ] Health check passes: `curl http://localhost:3001/health`
- [ ] Domain accessible: `curl http://rn-firebase-chat-mcp.rnbase.online/health`
- [ ] Logs show no errors: `sudo journalctl -u rn-firebase-chat-mcp -n 50`

## 🎉 Summary

The configuration system is now:
- ✅ Centralized in `.env` file
- ✅ Automatically created during deployment
- ✅ Easy to update without touching service files
- ✅ Well documented
- ✅ Consistent across all environments

All port and environment configuration is now managed through the `.env` file, making deployment and maintenance much simpler!

