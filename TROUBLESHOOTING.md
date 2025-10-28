# MCP Server Troubleshooting Guide

## Current Status

✅ **MCP Server**: Working correctly  
✅ **Configuration**: Updated to `rn-firebase-chat`  
✅ **Build**: Successful  
⚠️ **Issue**: Duplicate initialization logs in Cursor  

## Problem: Duplicate Logs in Cursor

### Symptoms
You see the same log message appearing multiple times:
```
[MCP] RAG pipeline initialized successfully
[MCP] RAG pipeline initialized successfully
```

### Root Cause
Cursor is running multiple instances of the MCP server.

### Solution: Complete Reset

#### Step 1: Kill All Running MCP Servers
```bash
# Find all running MCP server processes
ps aux | grep "dist/mcp/server.js" | grep -v grep

# Kill them (replace PID with actual process IDs)
kill -9 78044 79875

# Or kill all at once
pkill -f "dist/mcp/server.js"
```

#### Step 2: Completely Quit Cursor
```bash
# Don't just close windows - completely quit the app
# Press: Cmd+Q
# Or from terminal:
osascript -e 'quit app "Cursor"'
```

#### Step 3: Verify Cursor Config
```bash
# Check the config is correct
cat ~/.cursor/mcp.json | jq '.mcpServers."rn-firebase-chat"'

# Should show:
# {
#   "command": "node",
#   "args": ["/Users/tungle/saigontechnology/rn-firebase-chat-rag/dist/mcp/server.js"],
#   "cwd": "/Users/tungle/saigontechnology/rn-firebase-chat-rag",
#   "env": {
#     "MCP_SERVER": "true"
#   }
# }
```

#### Step 4: Verify Build is Up-to-Date
```bash
cd /Users/tungle/saigontechnology/rn-firebase-chat-rag
npm run build
```

#### Step 5: Restart Cursor
1. Open Cursor fresh
2. Wait 10 seconds for full initialization
3. Open MCP panel (if available in your version)
4. Check that only ONE `rn-firebase-chat` server is listed

#### Step 6: Test the Connection
Open a new chat in Cursor and try:
```
Can you use the rn-firebase-chat MCP server to search for "Firebase authentication"?
```

## Verification Commands

### Test MCP Server Directly
```bash
cd /Users/tungle/saigontechnology/rn-firebase-chat-rag

# Test server startup
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | MCP_SERVER=true node dist/mcp/server.js 2>&1 | head -20
```

Expected output:
```
[MCP] Starting MCP server...
[MCP] Project root: /Users/tungle/saigontechnology/rn-firebase-chat-rag
[MCP] Server connected via stdio
[MCP] Starting RAG pipeline initialization...
{"result":{"protocolVersion":"2024-11-05",...},"jsonrpc":"2.0","id":1}
[MCP] RAG pipeline initialized successfully
```

### Check Server Status
```bash
# List all MCP servers in Cursor config
cat ~/.cursor/mcp.json | jq '.mcpServers | keys'

# Should include: "rn-firebase-chat"
# Should NOT include: "rn-firebase-chat-rag"
```

### Check Running Processes
```bash
# Should show NO processes (when Cursor is not running)
ps aux | grep "dist/mcp/server.js" | grep -v grep

# Should show ONLY ONE process per MCP server (when Cursor IS running)
```

## Common Issues

### Issue 1: "Command not found: node"

**Problem**: Cursor can't find the Node.js binary

**Solution**: Use absolute path in `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "rn-firebase-chat": {
      "command": "/Users/tungle/.nvm/versions/node/v20.19.5/bin/node",
      "args": ["/Users/tungle/saigontechnology/rn-firebase-chat-rag/dist/mcp/server.js"],
      ...
    }
  }
}
```

### Issue 2: "Module not found"

**Problem**: Dependencies not installed or build is stale

**Solution**:
```bash
cd /Users/tungle/saigontechnology/rn-firebase-chat-rag
npm install
npm run build
```

### Issue 3: "VectorStore not initialized"

**Problem**: LanceDB data missing or RAG pipeline not ready

**Solution**:
```bash
# Check if LanceDB data exists
ls -la data/lancedb/

# If missing, run the main server once to initialize:
npm run dev
# Wait for "Documents indexed successfully"
# Then Ctrl+C and restart Cursor
```

### Issue 4: "Unexpected non-whitespace character after JSON"

**Problem**: Console logging polluting stdout

**Solution**: This is already fixed! Make sure:
1. `MCP_SERVER=true` is set in the environment (already in config)
2. You're using the latest build: `npm run build`

## Project Rename Summary

The project was renamed from `rn-firebase-chat-rag` to `rn-firebase-chat`:

### What Changed:
- ✅ Package name in `package.json`
- ✅ MCP server name in `src/mcp/server.ts`
- ✅ Server key in `~/.cursor/mcp.json`
- ✅ Documentation references

### What Stayed the Same:
- ✅ Directory name: `/Users/tungle/saigontechnology/rn-firebase-chat-rag/`
- ✅ All file paths
- ✅ All functionality
- ✅ Database location

## Debug Mode

### Enable Verbose Logging

Temporarily modify `src/config/logger.ts` to always log to stderr (even in MCP mode):

```typescript
// Around line 15, change:
if (process.env.MCP_SERVER !== 'true') {
  // ... console transport
}

// To:
// Always add stderr for debugging
transports.push(
  new winston.transports.Console({
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
      })
    ),
    stream: process.stderr, // Use stderr instead of stdout
  })
);
```

Then rebuild and test:
```bash
npm run build
npm run mcp:prod 2>&1 | tee mcp-debug.log
```

## Getting Help

If issues persist after following this guide:

1. **Capture full logs**:
   ```bash
   MCP_SERVER=true node dist/mcp/server.js 2>&1 | tee mcp-full.log
   # Send first initialize request
   # Capture the output
   ```

2. **Check Cursor logs** (if available):
   - Look for Cursor's application logs
   - Check for MCP-related error messages

3. **Verify environment**:
   ```bash
   node --version  # Should be >= 18.0.0
   npm --version
   cat .env        # Verify all configs
   ```

4. **Test REST API** (to isolate MCP issues):
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Try the retrieve endpoint
   ```

## Success Checklist

After fixing, you should be able to:

- [ ] See only ONE `rn-firebase-chat` server in Cursor's MCP panel
- [ ] See initialization log only ONCE
- [ ] Successfully call `retrieve_context` tool from Cursor
- [ ] View `rag://overview` resource
- [ ] View `rag://documents` resource
- [ ] Get relevant results when asking about Firebase/chat documentation

---

**Last Updated**: October 28, 2025  
**MCP Server Version**: 1.0.0  
**Server Name**: `rn-firebase-chat`

