# Deploying MCP Server to Vercel

This guide explains how to deploy your React Native Firebase Chat RAG MCP server to Vercel.

## Overview

The MCP server has been configured to run on Vercel using the `mcp-handler` package, which provides HTTP transport for Model Context Protocol servers. This allows AI assistants to interact with your RAG system through Vercel's serverless infrastructure.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): Install with `npm i -g vercel`
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Project Structure

```
rn-firebase-chat-rag/
├── api/
│   ├── mcp/
│   │   └── index.ts              # Main MCP handler
│   └── .well-known/
│       └── oauth-protected-resource/
│           └── index.ts          # OAuth metadata endpoint
├── docs/                         # Documentation files
├── data/
│   └── lancedb/                  # Vector database
├── src/
│   └── rag/                      # RAG pipeline code
├── vercel.json                   # Vercel configuration
└── package.json
```

## Configuration Files

### 1. `vercel.json`

The Vercel configuration file defines:
- Function runtime (Node.js 20.x)
- Memory allocation (1024 MB)
- Maximum duration (30 seconds)
- URL rewrites for clean endpoints

### 2. `api/mcp/index.ts`

The main MCP handler that exposes three tools:
- `retrieve_context`: Search documentation by semantic query
- `search_by_metadata`: Filter documentation by metadata
- `get_stats`: Get system statistics

### 3. `api/.well-known/oauth-protected-resource/index.ts`

OAuth metadata endpoint for MCP authorization (optional, for production use).

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Select the repository containing this project

2. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables** (Optional):
   Add these if you need custom paths:
   ```
   DOCS_PATH=/path/to/docs
   LANCEDB_PATH=/path/to/lancedb
   AUTH_SERVER_URLS=https://your-auth-server.com
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your MCP server will be available at `https://your-project.vercel.app/api/mcp`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   # Deploy to preview
   vercel
   
   # Deploy to production
   vercel --prod
   ```

## Testing Your Deployment

### 1. Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector@latest https://your-project.vercel.app
```

Then:
1. Open `http://127.0.0.1:6274` in your browser
2. Select "Streamable HTTP" transport
3. Enter URL: `https://your-project.vercel.app/api/mcp`
4. Click "Connect"
5. Test the tools under the "Tools" section

### 2. Configure MCP Client (e.g., Cursor)

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

### 3. Test with cURL

```bash
# Test the MCP endpoint
curl https://your-project.vercel.app/api/mcp

# Test OAuth metadata endpoint
curl https://your-project.vercel.app/.well-known/oauth-protected-resource
```

## Environment Variables

You can configure these environment variables in Vercel:

| Variable | Description | Default |
|----------|-------------|---------|
| `DOCS_PATH` | Path to documentation files | `./docs` |
| `LANCEDB_PATH` | Path to LanceDB vector store | `./data/lancedb` |
| `AUTH_SERVER_URLS` | Comma-separated OAuth server URLs | `https://example-authorization-server-issuer.com` |
| `NODE_ENV` | Node environment | `production` |

## Adding OAuth Authorization (Optional)

To secure your MCP server with OAuth:

1. **Update `api/mcp/index.ts`**:
   ```typescript
   import { withMcpAuth } from 'mcp-handler';
   
   const verifyToken = async (req: Request, bearerToken?: string) => {
     // Implement your token verification logic
     if (!bearerToken) return undefined;
     
     // Verify token with your auth provider
     const isValid = await verifyWithAuthProvider(bearerToken);
     if (!isValid) return undefined;
     
     return {
       token: bearerToken,
       scopes: ['read:docs'],
       clientId: 'user-id',
     };
   };
   
   const authHandler = withMcpAuth(handler, verifyToken, {
     required: true,
     requiredScopes: ['read:docs'],
     resourceMetadataPath: '/.well-known/oauth-protected-resource',
   });
   
   export { authHandler as GET, authHandler as POST, authHandler as DELETE };
   ```

2. **Update OAuth Metadata**:
   - Edit `api/.well-known/oauth-protected-resource/index.ts`
   - Replace `AUTH_SERVER_URLS` with your actual authorization server

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

## Vercel Features for MCP

Your MCP server benefits from Vercel's features:

- **Fluid Compute**: Optimized for irregular usage patterns
- **Auto-scaling**: Handles traffic spikes automatically
- **Edge Network**: Low latency worldwide
- **Instant Rollback**: Revert to previous deployments quickly
- **Preview Deployments**: Test changes before production
- **Vercel Firewall**: DDoS protection and security

## Performance Optimization

### Cold Start Optimization

The RAG pipeline is initialized on first request and cached for subsequent requests. To reduce cold starts:

1. **Increase Memory**: In `vercel.json`, increase memory to 1024 MB or higher
2. **Use Vercel Cron**: Keep functions warm with periodic pings
3. **Optimize Bundle**: Minimize dependencies in `api/` folder

### Memory Configuration

Adjust memory in `vercel.json`:

```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 2048,  // Increase for larger models
      "maxDuration": 60
    }
  }
}
```

## Troubleshooting

### Function Timeout

If you get timeout errors:
1. Increase `maxDuration` in `vercel.json` (max 60s for Pro plans)
2. Optimize RAG pipeline initialization
3. Consider using Vercel Edge Functions for faster cold starts

### Memory Errors

If you get out-of-memory errors:
1. Increase `memory` in `vercel.json`
2. Reduce chunk size in RAG pipeline
3. Limit number of documents indexed

### Build Errors

If build fails:
1. Check TypeScript compilation: `npm run build`
2. Ensure all dependencies are in `package.json`
3. Check Vercel build logs for specific errors

### RAG Pipeline Not Ready

If tools return "RAG pipeline is not ready":
1. Wait a few seconds and try again (first request initializes the pipeline)
2. Check Vercel function logs for initialization errors
3. Verify `docs/` and `data/lancedb/` are included in deployment

## Monitoring

### Vercel Dashboard

Monitor your MCP server:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. View:
   - Function invocations
   - Response times
   - Error rates
   - Bandwidth usage

### Logs

View real-time logs:
```bash
vercel logs your-project-name
```

Or in the Vercel dashboard under "Functions" → "Logs"

## Cost Estimation

Vercel pricing for MCP servers:

- **Hobby Plan** (Free):
  - 100 GB-hours/month
  - Good for testing and small projects

- **Pro Plan** ($20/month):
  - 1000 GB-hours/month
  - Longer function duration (60s)
  - Better for production use

Calculate costs at [vercel.com/pricing](https://vercel.com/pricing)

## Next Steps

1. **Deploy to Vercel**: Follow the deployment steps above
2. **Test Your Server**: Use MCP Inspector to verify functionality
3. **Configure Clients**: Add your Vercel URL to MCP clients
4. **Monitor Usage**: Check Vercel dashboard for performance metrics
5. **Add OAuth** (Optional): Secure your server with authentication

## Resources

- [Vercel MCP Documentation](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
- [MCP Handler Package](https://www.npmjs.com/package/mcp-handler)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [Vercel Functions Documentation](https://vercel.com/docs/functions)

## Support

For issues or questions:
- Check Vercel function logs
- Review MCP server implementation in `api/mcp/index.ts`
- Test locally with `npm run dev` before deploying
- Contact Vercel support for platform-specific issues

