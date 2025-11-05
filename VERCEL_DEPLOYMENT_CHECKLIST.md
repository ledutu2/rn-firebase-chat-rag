# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment of your MCP server to Vercel.

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [x] `mcp-handler` and `zod` packages installed
- [x] `/api/mcp/index.ts` created
- [x] `/api/.well-known/oauth-protected-resource/index.ts` created
- [x] `vercel.json` configuration file created
- [x] `.vercelignore` file created
- [ ] All code committed to Git repository

### 2. Local Testing
- [ ] Run `npm run build` successfully
- [ ] Test with `./test-vercel-local.sh` (optional)
- [ ] Verify no TypeScript errors
- [ ] Check that `docs/` directory has documentation
- [ ] Verify `data/lancedb/` exists with indexed data

### 3. Git Repository
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] Repository is accessible
- [ ] Main/master branch is up to date

## 🚀 Deployment Steps

### Option A: Vercel Dashboard (Recommended for First Time)

1. **Sign Up/Login**
   - [ ] Go to [vercel.com](https://vercel.com)
   - [ ] Sign up or log in with GitHub/GitLab/Bitbucket

2. **Import Project**
   - [ ] Click "Add New Project"
   - [ ] Select your Git repository
   - [ ] Click "Import"

3. **Configure Project**
   - [ ] Framework Preset: **Other**
   - [ ] Root Directory: `./` (default)
   - [ ] Build Command: `npm run build` (default)
   - [ ] Output Directory: `dist` (default)

4. **Environment Variables** (Optional)
   - [ ] Add `DOCS_PATH` if needed
   - [ ] Add `LANCEDB_PATH` if needed
   - [ ] Add `AUTH_SERVER_URLS` if using OAuth

5. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for build to complete (2-5 minutes)
   - [ ] Note your deployment URL: `https://your-project.vercel.app`

### Option B: Vercel CLI (For Subsequent Deployments)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```
   - [ ] CLI installed

2. **Login**
   ```bash
   vercel login
   ```
   - [ ] Logged in successfully

3. **Deploy**
   ```bash
   # Preview deployment
   vercel
   
   # Production deployment
   vercel --prod
   ```
   - [ ] Deployment successful
   - [ ] URL received

## 🧪 Post-Deployment Testing

### 1. Basic Connectivity
```bash
# Test MCP endpoint
curl https://your-project.vercel.app/api/mcp
```
- [ ] Returns MCP metadata (not 404)

### 2. OAuth Metadata (Optional)
```bash
# Test OAuth endpoint
curl https://your-project.vercel.app/.well-known/oauth-protected-resource
```
- [ ] Returns OAuth metadata

### 3. MCP Inspector
```bash
npx @modelcontextprotocol/inspector@latest https://your-project.vercel.app
```
- [ ] Inspector opens at http://127.0.0.1:6274
- [ ] Select "Streamable HTTP" transport
- [ ] Enter URL: `https://your-project.vercel.app/api/mcp`
- [ ] Click "Connect"
- [ ] Connection successful
- [ ] Tools appear in list (retrieve_context, search_by_metadata, get_stats)

### 4. Test Tools
In MCP Inspector:
- [ ] Click "List Tools"
- [ ] Test `retrieve_context` with: "How to implement Firebase chat?"
- [ ] Verify results are returned
- [ ] Test `get_stats` tool
- [ ] Verify document count matches expectations

### 5. Configure MCP Client (Cursor/Claude)

**Cursor Configuration:**
1. Open `~/.cursor/mcp.json` (or create if doesn't exist)
2. Add configuration:
   ```json
   {
     "mcpServers": {
       "rn-firebase-chat-vercel": {
         "url": "https://your-project.vercel.app/api/mcp"
       }
     }
   }
   ```
3. Save file
4. Restart Cursor completely (Cmd+Q, then reopen)

- [ ] Configuration added to `~/.cursor/mcp.json`
- [ ] Cursor restarted
- [ ] MCP server shows as "connected" in Cursor
- [ ] Test query: "How to implement Firebase chat?"
- [ ] Receives relevant documentation

## 📊 Monitoring

### 1. Vercel Dashboard
- [ ] Open [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Select your project
- [ ] Check deployment status: ✅ Ready
- [ ] Review function invocations
- [ ] Check for errors in logs

### 2. Function Logs
```bash
vercel logs your-project-name
```
- [ ] Logs accessible
- [ ] No critical errors
- [ ] RAG pipeline initialization successful

### 3. Performance Metrics
- [ ] Response times acceptable (< 5s after cold start)
- [ ] No timeout errors
- [ ] No memory errors

## 🔧 Troubleshooting

### Common Issues

#### ❌ "RAG pipeline is not ready"
**Solution:**
- Wait 5-10 seconds after first request (cold start)
- Check function logs for initialization errors
- Verify `docs/` and `data/lancedb/` are included in deployment

**Checklist:**
- [ ] Waited for cold start to complete
- [ ] Checked function logs
- [ ] Verified data files are deployed

#### ❌ Function timeout
**Solution:**
- Increase `maxDuration` in `vercel.json`
- Optimize RAG pipeline initialization
- Consider upgrading to Pro plan (60s max)

**Checklist:**
- [ ] Updated `maxDuration` in `vercel.json`
- [ ] Redeployed
- [ ] Tested again

#### ❌ Memory errors
**Solution:**
- Increase `memory` in `vercel.json` to 2048 MB
- Reduce chunk size in RAG pipeline
- Limit number of documents

**Checklist:**
- [ ] Updated `memory` in `vercel.json`
- [ ] Redeployed
- [ ] Tested again

#### ❌ Build fails
**Solution:**
- Run `npm run build` locally
- Fix TypeScript errors
- Check Vercel build logs

**Checklist:**
- [ ] Local build successful
- [ ] No TypeScript errors
- [ ] Reviewed Vercel build logs

#### ❌ 404 Not Found
**Solution:**
- Verify URL is correct: `https://your-project.vercel.app/api/mcp`
- Check `vercel.json` rewrites configuration
- Review deployment logs

**Checklist:**
- [ ] URL is correct
- [ ] `vercel.json` has correct rewrites
- [ ] Deployment completed successfully

## 🔐 Security (Optional)

### Add OAuth Authorization
If you need to secure your MCP server:

1. **Update MCP Handler**
   - [ ] Implement `verifyToken` function in `/api/mcp/index.ts`
   - [ ] Wrap handler with `withMcpAuth`
   - [ ] Configure required scopes

2. **Update OAuth Metadata**
   - [ ] Update `AUTH_SERVER_URLS` in environment variables
   - [ ] Redeploy

3. **Test Authorization**
   - [ ] Test with valid token
   - [ ] Test with invalid token (should fail)
   - [ ] Verify scopes are enforced

## 📈 Optimization (Optional)

### Performance Tuning
- [ ] Increase memory allocation if needed
- [ ] Adjust `maxDuration` based on actual usage
- [ ] Set up Vercel Cron for warming functions
- [ ] Monitor and optimize cold start times

### Cost Optimization
- [ ] Review usage in Vercel dashboard
- [ ] Optimize function memory allocation
- [ ] Consider caching strategies
- [ ] Monitor GB-hours usage

## ✅ Final Verification

### Deployment Complete
- [ ] MCP server accessible at Vercel URL
- [ ] All tools working correctly
- [ ] Configured in Cursor/Claude Desktop
- [ ] Successfully tested with real queries
- [ ] Monitoring set up
- [ ] Documentation updated with deployment URL

### Documentation
- [ ] Updated README with deployment URL
- [ ] Shared deployment URL with team
- [ ] Documented any custom configuration
- [ ] Created runbook for troubleshooting

## 🎉 Success!

If all items are checked, your MCP server is successfully deployed to Vercel!

### Next Steps
1. Share the deployment URL with your team
2. Monitor usage and performance
3. Set up alerts for errors (optional)
4. Plan for scaling if needed

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Project README](./README.md)
- [Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Quick Start](./VERCEL_QUICK_START.md)

---

**Deployment Date:** _________________

**Deployment URL:** _________________

**Deployed By:** _________________

**Notes:**
_________________
_________________
_________________

