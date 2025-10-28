# MCP Troubleshooting Guide

## Issue Identified ✅

**Problem**: Cursor wasn't calling the MCP server because the LanceDB database was corrupted.

**Root Cause**: The database manifest referenced a missing data file (`d5bf35aa-fd53-4ede-bf96-77e1917d926b.lance`), causing all retrieval operations to fail.

**Solution**: Database has been reinitialized successfully with 36 document chunks.

---

## Current Status

✅ **MCP Server Configuration**: Correctly configured in `~/.cursor/mcp.json`  
✅ **Build**: TypeScript compiled to `dist/mcp/server.js`  
✅ **Database**: Reinitialized with 36 chunks from `docs/rn-firebase-chat-doc.md`  
✅ **Embedding Model**: Xenova/bge-base-en-v1.5  
✅ **LLM Model**: llama3  

---

## Next Steps

### 1. Restart Cursor Completely

The MCP server is managed by Cursor and needs to be restarted:

```bash
# Quit Cursor completely
# Press Cmd+Q (or click Cursor > Quit)
# Then reopen Cursor
```

### 2. Verify MCP Server Started

After reopening Cursor, check if the MCP server started automatically:

```bash
# Check if process is running
ps aux | grep "dist/mcp/server.js" | grep -v grep

# You should see something like:
# tungle  12345  0.0  1.0  node /Users/tungle/.../dist/mcp/server.js
```

### 3. Test the MCP Tools

In a new Cursor chat, ask questions that should trigger the MCP tools:

**Example questions:**
- "How does Firebase authentication work in the chat app?"
- "Explain message pagination in Firebase chat"
- "What's the structure of chat messages?"
- "How are real-time updates handled?"

**What should happen:**
- Cursor should automatically call `mcp_rn-firebase-chat_retrieve_context`
- You'll see relevant documentation chunks being retrieved
- The AI will answer based on the actual documentation

---

## Testing MCP Tools Directly

If you want to verify the tools work, you can call them directly in the chat:

### Test 1: Get Stats
```
Use the mcp_rn-firebase-chat_get_stats tool
```

**Expected output:**
```json
{
  "documentCount": 36,
  "isInitialized": true,
  "configuration": {
    "embeddingModel": "Xenova/bge-base-en-v1.5",
    "model": "llama3",
    "topKResults": 5,
    "chunkSize": 1000,
    "chunkOverlap": 200
  }
}
```

### Test 2: Retrieve Context
```
Use mcp_rn-firebase-chat_retrieve_context to find information about Firebase authentication
```

**Expected output:** Relevant documentation chunks about authentication.

---

## Common Issues & Solutions

### Issue: "MCP server not found"

**Solution:**
```bash
# Verify mcp.json exists and is correct
cat ~/.cursor/mcp.json | grep rn-firebase-chat

# Rebuild the project
cd /Users/tungle/saigontechnology/rn-firebase-chat-rag
npm run build

# Restart Cursor
```

### Issue: "Database errors" or "File not found"

**Solution:**
```bash
# Run the reinitialization script
cd /Users/tungle/saigontechnology/rn-firebase-chat-rag
./reinit-database.sh

# Then restart Cursor
```

### Issue: "Cursor doesn't call MCP automatically"

**Possible causes:**
1. Question isn't specific enough → Try more specific questions about Firebase chat
2. MCP server not running → Check `ps aux | grep dist/mcp/server.js`
3. Database not initialized → Run `./reinit-database.sh`

**Manual trigger:** Explicitly mention the tool in your prompt:
```
Use the rn-firebase-chat MCP tools to answer: How does Firebase auth work?
```

---

## Manual MCP Server Management

### Start MCP Server Manually (for testing)
```bash
cd /Users/tungle/saigontechnology/rn-firebase-chat-rag
MCP_SERVER=true node dist/mcp/server.js
```

### Check MCP Server Logs
The MCP server writes to stderr. When running manually, you'll see:
```
[MCP] Starting MCP server...
[MCP] Server connected via stdio
[MCP] RAG pipeline initialized successfully
```

### Kill MCP Server
```bash
pkill -f "dist/mcp/server.js"
```

---

## File Locations

- **MCP Config**: `~/.cursor/mcp.json`
- **MCP Server**: `/Users/tungle/saigontechnology/rn-firebase-chat-rag/dist/mcp/server.js`
- **Database**: `/Users/tungle/saigontechnology/rn-firebase-chat-rag/data/lancedb/documents.lance/`
- **Source Docs**: `/Users/tungle/saigontechnology/rn-firebase-chat-rag/docs/rn-firebase-chat-doc.md`
- **Cursor Rules**: `/Users/tungle/saigontechnology/rn-firebase-chat-rag/.cursorrules`

---

## Quick Commands

```bash
# Full reinitialization
./reinit-database.sh

# Just rebuild
npm run build

# Reset MCP (includes rebuild)
./reset-mcp.sh

# Check if server is running
ps aux | grep "dist/mcp/server.js" | grep -v grep

# View database files
ls -la data/lancedb/documents.lance/data/
```

---

## Understanding .cursorrules

The `.cursorrules` file helps guide Cursor's AI to use the MCP tools appropriately:

- Defines when to use each MCP tool
- Lists example queries that should trigger MCP usage
- Provides context about the project structure

**Important**: After changing `.cursorrules`, restart Cursor to ensure it picks up the changes.

---

## Verification Checklist

Before asking questions, verify:

- [ ] MCP server process is running (`ps aux | grep dist/mcp/server.js`)
- [ ] Database exists (`ls data/lancedb/documents.lance/data/`)
- [ ] Build is up to date (`npm run build` recently)
- [ ] Cursor has been restarted after any configuration changes
- [ ] `.cursorrules` file exists in project root

---

## Success Indicators

You'll know it's working when:

1. ✅ You ask about Firebase chat features
2. ✅ Cursor automatically calls `mcp_rn-firebase-chat_retrieve_context`
3. ✅ You see tool results in the chat (JSON with documentation chunks)
4. ✅ AI provides answers based on the actual documentation

---

## Need More Help?

1. Check the logs: `tail -f logs/combined.log`
2. Run the reinitialization script: `./reinit-database.sh`
3. Review the MCP server code: `src/mcp/server.ts`
4. Check the RAG pipeline: `src/rag/pipeline.ts`

---

**Last Updated**: October 28, 2025  
**Status**: ✅ Database reinitialized, ready for Cursor restart

