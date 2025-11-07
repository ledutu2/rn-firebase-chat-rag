# Deployment Files

This directory contains all the necessary files to deploy the RN Firebase Chat MCP Server to a VPS.

## 📁 Files

- **`setup-vps.sh`** - Initial VPS setup script (run once)
- **`deploy.sh`** - Main deployment script (run for each deployment)
- **`nginx.conf`** - Nginx reverse proxy configuration
- **`rn-firebase-chat-mcp.service`** - Systemd service file
- **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment guide

## 🚀 Quick Start

### 1. Upload Project to VPS

```bash
# From your local machine
scp -r /path/to/rn-firebase-chat-rag locnguyent@10.30.10.35:/home/locnguyent/
```

Or clone from git:

```bash
# On VPS
ssh locnguyent@10.30.10.35
cd /home/locnguyent
git clone <your-repo-url> rn-firebase-chat-rag
```

### 2. Run Setup (One-time)

```bash
# SSH into VPS
ssh locnguyent@10.30.10.35

# Run setup as root/sudo
sudo bash /home/locnguyent/rn-firebase-chat-rag/deploy/setup-vps.sh
```

### 3. Deploy Application

```bash
# As locnguyent user
su - locnguyent
cd /home/locnguyent/rn-firebase-chat-rag
bash deploy/deploy.sh
```

### 4. Verify

```bash
# Check service
sudo systemctl status rn-firebase-chat-mcp

# Test locally
curl http://localhost:3001/health

# Test via domain
curl http://rn-firebase-chat-mcp.rnbase.online/health
```

## 📖 Documentation

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🔧 Configuration

### VPS Details
- **Host**: 10.30.10.35
- **User**: locnguyent
- **Project Path**: /home/locnguyent/rn-firebase-chat-rag

### Service Details
- **Service Name**: rn-firebase-chat-mcp
- **Internal Port**: 3001
- **Domain**: rn-firebase-chat-mcp.rnbase.online
- **Protocol**: HTTP (HTTPS after SSL setup)

## 📝 Notes

- Make scripts executable: `chmod +x deploy/*.sh`
- Always test Nginx config: `sudo nginx -t`
- View logs: `sudo journalctl -u rn-firebase-chat-mcp -f`
- Restart service: `sudo systemctl restart rn-firebase-chat-mcp`

## 🔒 Security

- Enable HTTPS with Let's Encrypt (see deployment guide)
- Configure firewall (UFW)
- Keep system and packages updated
- Regular backups of `/home/locnguyent/rn-firebase-chat-rag/data/`

## 🐛 Troubleshooting

See the [Troubleshooting section](./DEPLOYMENT_GUIDE.md#-troubleshooting) in the deployment guide.

