# MCP Server Setup Guide

## Overview

The MCP (Model Context Protocol) server for `rn-firebase-chat` exposes RAG functionality to AI assistants like Claude and Cursor, allowing them to retrieve context from your documentation.

## Current Status

✅ **MCP Server is configured and ready to use**

- **72 documents** indexed from `docs/rn-firebase-chat-doc.md`
- **3 tools** available: `retrieve_context`, `search_by_metadata`, `get_stats`
- **2 resources** available: System overview and document list
- Using absolute paths for reliability

## Configuration

The MCP server is already configured in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "rn-firebase-chat": {
      "command": "node",
      "args": [
        "/Users/tungle/saigontechnology/rn-firebase-chat-rag/dist/mcp/server.js"
      ],
      "cwd": "/Users/tungle/saigontechnology/rn-firebase-chat-rag",
      "env": {
        "MCP_SERVER": "true"
      }
    }
  }
}
```

## Available Tools

### 1. `retrieve_context`
Retrieve relevant documentation chunks based on a query.

**Parameters:**
- `question` (required): The question to search for
- `limit` (optional): Max chunks to return (1-20, default: 5)

**Example:**
```json
{
  "name": "retrieve_context",
  "arguments": {
    "question": "What are chunking strategies for RAG?",
    "limit": 3
  }
}
```

### 2. `search_by_metadata`
Search documentation using metadata filters.

**Parameters:**
- `filters` (required): Key-value pairs to filter by
- `limit` (optional): Max results (1-100, default: 10)

**Example:**
```json
{
  "name": "search_by_metadata",
  "arguments": {
    "filters": {
      "chunkIndex": 2
    },
    "limit": 5
  }
}
```

### 3. `get_stats`
Get system statistics including document count and configuration.

**Example:**
```json
{
  "name": "get_stats",
  "arguments": {}
}
```

## Available Resources

### 1. `rag://overview`
System overview with statistics and configuration.

### 2. `rag://documents`
List of all indexed document chunks with previews.

## Using in Cursor

1. **Restart Cursor** after any configuration changes
2. **Open the MCP panel** in Cursor
3. **Verify** that `rn-firebase-chat` server is listed and connected
4. **Ask questions** like:
   - "What are the best chunking strategies for RAG systems?"
   - "How should I handle code examples in chunks?"
   - "What are common pitfalls in chunking?"

The AI will automatically use the `retrieve_context` tool to fetch relevant documentation.

## Key Features

### Absolute Paths
The server uses absolute paths to ensure it works regardless of the working directory:
- Docs: `/Users/tungle/saigontechnology/rn-firebase-chat-rag/docs`
- Database: `/Users/tungle/saigontechnology/rn-firebase-chat-rag/data/lancedb`

### Smart Initialization
- Skips re-indexing if documents already exist
- Non-blocking initialization (server responds immediately)
- Graceful fallback if RAG pipeline isn't ready

### Error Handling
- Proper `McpError` types with error codes
- Helpful error messages for debugging
- Continues running even if initialization fails

## Troubleshooting

### Server Not Showing in Cursor
1. Check `~/.cursor/mcp.json` has the correct configuration
2. Restart Cursor completely
3. Check Cursor's MCP panel for error messages

### No Documents Found
1. Verify documents exist in `docs/` folder
2. Restart the REST API server to re-index: `npm run dev`
3. Check logs at `/tmp/rag-server.log`

### Initialization Errors
1. Check stderr output in Cursor's MCP panel
2. Ensure Ollama is running: `ollama serve`
3. Verify model is available: `ollama list`

## Development

### Rebuild After Changes
```bash
npm run build
```

### Test MCP Server Locally
```bash
npm run mcp:prod
```

### View Logs
Check stderr output - logs are written to stderr, not stdout (to avoid polluting JSON-RPC).

## Architecture

```
src/mcp/server.ts
├── Uses RAGPipeline with absolute paths
├── Implements 3 MCP tools
├── Provides 2 MCP resources
└── Non-blocking initialization

Key Changes Made:
├── Added absolute path resolution
├── Skip re-indexing existing documents  
├── Enhanced error messages
└── Improved logging to stderr
```

## Next Steps

1. **Test in Cursor**: Ask questions about chunking strategies
2. **Monitor Performance**: Check initialization time and query speed
3. **Add More Documents**: Place additional `.md` files in `docs/`
4. **Customize Tools**: Modify `src/mcp/server.ts` to add new tools

---

**Server Version:** 1.0.0  
**Last Updated:** October 28, 2025

