# Quick Start: Deploy Public MCP Server to Vercel

Get your React Native Firebase Chat RAG MCP server running on Vercel in 5 minutes.

🌐 **Public Access**: This server is configured for public use - no authentication required!

## Prerequisites

- Vercel account ([sign up free](https://vercel.com/signup))
- Git repository (GitHub, GitLab, or Bitbucket)

## 🚀 Deploy in 3 Steps

### Step 1: Push to Git

```bash
git add .
git commit -m "Add Vercel MCP server deployment"
git push origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository
4. Click "Import"

### Step 3: Deploy

1. **Framework Preset**: Select "Other"
2. **Build Command**: `npm run build` (default)
3. **Output Directory**: `dist` (default)
4. Click **"Deploy"**

That's it! Your MCP server will be live at `https://your-project.vercel.app/api/mcp`

## 🧪 Test Your Deployment

### Option 1: MCP Inspector (Recommended)

```bash
npx @modelcontextprotocol/inspector@latest https://your-project.vercel.app
```

1. Open http://127.0.0.1:6274
2. Select "Streamable HTTP"
3. Enter: `https://your-project.vercel.app/api/mcp`
4. Click "Connect"
5. Try the `retrieve_context` tool with: "How to implement Firebase chat?"

### Option 2: Configure Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "rn-firebase-chat-vercel": {
      "url": "https://your-project.vercel.app/api/mcp"
    }
  }
}
```

Then ask Cursor: "How do I implement Firebase chat in React Native?"

### Option 3: cURL Test

```bash
curl https://your-project.vercel.app/api/mcp
```

You should see MCP server metadata.

## 🛠️ Available Tools

Your deployed MCP server provides 3 tools:

1. **retrieve_context**: Search documentation by query
   - Example: "How to implement Firebase chat?"
   
2. **search_by_metadata**: Filter by metadata
   - Example: `{"section": "Authentication"}`
   
3. **get_stats**: Get system statistics
   - Shows document count and configuration

## 📊 Monitor Your Deployment

View your deployment:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Check:
   - ✅ Deployment status
   - 📈 Function invocations
   - ⚡ Response times
   - 🐛 Error logs

## 🔧 Local Testing (Before Deploying)

Test locally with Vercel dev server:

```bash
# Run the test script
./test-vercel-local.sh

# Or manually
vercel dev
```

Then test at `http://localhost:3000/api/mcp`

## 🌐 Public Access

This MCP server is configured for **public access** - anyone can use it without authentication!

Share your URL with the community and let everyone benefit from AI-powered documentation search.

## 🆘 Troubleshooting

### "RAG pipeline is not ready"
- **Solution**: Wait 5-10 seconds after first request (cold start)
- The pipeline initializes on first use

### Function timeout
- **Solution**: Increase `maxDuration` in `vercel.json`
- Pro plan allows up to 60 seconds

### Memory errors
- **Solution**: Increase `memory` in `vercel.json`
- Try 2048 MB for larger models

### Build fails
- **Solution**: Run `npm run build` locally first
- Check for TypeScript errors

## 📚 Next Steps

- ✅ Deploy to Vercel
- ✅ Test with MCP Inspector
- ✅ Configure in Cursor/Claude Desktop
- ✅ Monitor usage in Vercel Dashboard
- 📖 Read full guide: `VERCEL_DEPLOYMENT.md`

## 💡 Tips

1. **First request is slow**: Cold start initializes RAG pipeline (~5-10s)
2. **Subsequent requests are fast**: Pipeline is cached
3. **Use Vercel Cron**: Keep functions warm with periodic pings
4. **Monitor costs**: Check Vercel dashboard regularly

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel MCP Docs](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Full Deployment Guide](./VERCEL_DEPLOYMENT.md)

---

**Need Help?** Check the full deployment guide in `VERCEL_DEPLOYMENT.md` or Vercel's documentation.

