# MCP Server Setup Guide

This guide explains how to set up and use the Model Context Protocol (MCP) server for integration with Cursor and Claude Desktop.

## What is MCP?

Model Context Protocol (MCP) is a standardized protocol for connecting AI assistants (like Claude) with external data sources and tools. Our MCP server exposes the RAG system's functionality as tools that can be used directly in Cursor or Claude Desktop.

## Prerequisites

1. **Built project**: Run `npm run build` to compile TypeScript to JavaScript
2. **Ollama running**: Ensure Ollama server is running with llama3 model
3. **Documents indexed**: Add markdown files to `./docs/` directory

## Setup for Cursor

### 1. Build the Project

```bash
npm run build
```

This compiles the TypeScript code to JavaScript in the `./dist/` directory.

### 2. Configure Cursor

#### Option A: Using Cursor Settings UI

1. Open Cursor
2. Go to Settings → Features → MCP
3. Add a new server with these settings:
   - **Name**: `rn-firebase-chat-rag`
   - **Command**: `npm`
   - **Args**: `run,mcp:prod`
   - **CWD**: `/Users/tungle/saigontechnology/rn-firebase-chat-rag`

#### Option B: Manual Configuration

Edit your Cursor MCP configuration file:

**macOS/Linux**: `~/.config/cursor/mcp.json`
**Windows**: `%APPDATA%\Cursor\mcp.json`

Add the following:

```json
{
  "mcpServers": {
    "rn-firebase-chat-rag": {
      "command": "npm",
      "args": ["run", "mcp:prod"],
      "cwd": "/Users/tungle/saigontechnology/rn-firebase-chat-rag"
    }
  }
}
```

⚠️ **Important**: Replace the `cwd` path with your actual project directory!

### 3. Restart Cursor

After adding the configuration, restart Cursor to load the MCP server.

### 4. Verify Connection

1. Open Cursor
2. Start a new chat with Claude
3. Type: "List available MCP tools"
4. You should see the RAG tools listed

## Setup for Claude Desktop

### 1. Configure Claude Desktop

Edit the Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add:

```json
{
  "mcpServers": {
    "rn-firebase-chat-rag": {
      "command": "npm",
      "args": ["run", "mcp:prod"],
      "cwd": "/Users/tungle/saigontechnology/rn-firebase-chat-rag"
    }
  }
}
```

### 2. Restart Claude Desktop

Completely quit and restart Claude Desktop.

## Available Tools

### 1. retrieve_context

Retrieve relevant documentation based on a query.

**Parameters:**
- `question` (string, required): The question or query
- `limit` (number, optional): Maximum results (1-20), default: 5

**Example usage in Cursor:**
```
Can you retrieve context about "Firebase chat authentication" using the RAG tool?
```

**Example response:**
```json
{
  "query": "Firebase chat authentication",
  "results": [
    {
      "content": "Firebase authentication for chat requires setting up user management...",
      "metadata": {
        "source": "firebase-auth.md",
        "title": "Firebase Authentication"
      },
      "relevanceScore": 0.89
    }
  ],
  "totalResults": 5
}
```

### 2. search_by_metadata

Search documentation using metadata filters.

**Parameters:**
- `filters` (object, required): Key-value pairs to filter by
- `limit` (number, optional): Maximum results (1-100), default: 10

**Example usage:**
```
Search for documents with source "firebase-chat.md" using the RAG metadata tool
```

**Example response:**
```json
{
  "filters": {
    "source": "firebase-chat.md"
  },
  "results": [...],
  "totalResults": 8
}
```

### 3. get_stats

Get system statistics and configuration.

**Parameters:** None

**Example usage:**
```
Get the RAG system statistics
```

**Example response:**
```json
{
  "documentCount": 42,
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

## Available Resources

### 1. rag://overview

System overview including statistics and configuration.

**Example usage:**
```
Show me the RAG system overview resource
```

### 2. rag://documents

List of all indexed documents (truncated).

**Example usage:**
```
List all documents in the RAG system
```

## Usage Examples

### Example 1: Ask About Documentation

**In Cursor chat:**
```
Using the RAG retrieve tool, find information about "how to style buttons"
```

Claude will:
1. Call `retrieve_context` with your query
2. Get relevant document chunks
3. Provide an answer based on the retrieved context

### Example 2: Search Specific Files

**In Cursor chat:**
```
Search the RAG system for all content from "styling.md" file
```

Claude will:
1. Call `search_by_metadata` with `{"source": "styling.md"}`
2. Return all chunks from that specific file

### Example 3: Check System Status

**In Cursor chat:**
```
What's the status of the RAG system? How many documents are indexed?
```

Claude will:
1. Call `get_stats`
2. Report the document count and configuration

## Troubleshooting

### MCP Server Not Showing in Cursor

**Solutions:**
1. Verify the configuration file path is correct
2. Check that JSON syntax is valid (no trailing commas)
3. Ensure the `cwd` path points to your project directory
4. Restart Cursor completely
5. Check Cursor logs for MCP errors

### "RAG Pipeline is still initializing"

**Solution:**
The pipeline initializes asynchronously. Wait 10-30 seconds and try again.

**Check initialization:**
```bash
# In another terminal, check the MCP server logs
npm run mcp

# Should show: "RAG Pipeline initialized successfully"
```

### Connection Errors

**Check these:**
1. Ollama is running: `ollama serve`
2. Model is available: `ollama list`
3. Documents exist in `./docs/`
4. Project is built: `npm run build`

### No Response from Tools

**Solutions:**
1. Check MCP server logs: `tail -f logs/combined.log`
2. Verify Ollama is responding: `curl http://localhost:11434/api/tags`
3. Test the REST API first: `curl http://localhost:3000/api/status`

## Development Mode

For development with hot reload:

```bash
npm run mcp
```

This uses `tsx` to run TypeScript directly without building.

## Production Mode

For production deployment:

```bash
# Build first
npm run build

# Then run
npm run mcp:prod
```

This runs the compiled JavaScript from `./dist/`.

## Logging

The MCP server logs to files (not console to avoid stdio interference):

```bash
# View all logs
tail -f logs/combined.log

# View errors only
tail -f logs/error.log
```

## Best Practices

1. **Keep documents updated**: Reindex when docs change
2. **Monitor logs**: Check for errors and performance
3. **Use specific queries**: More specific questions get better results
4. **Limit results**: Use appropriate limits to avoid overwhelming responses
5. **Rebuild after changes**: Run `npm run build` after code changes

## Advanced Configuration

### Custom Port for REST API

If running both MCP and REST API simultaneously:

1. Change `PORT` in `.env` for REST API
2. MCP server doesn't use HTTP, so no conflict

### Multiple MCP Servers

You can run multiple MCP servers:

```json
{
  "mcpServers": {
    "rag-docs": {
      "command": "npm",
      "args": ["run", "mcp:prod"],
      "cwd": "/path/to/docs-rag"
    },
    "rag-code": {
      "command": "npm",
      "args": ["run", "mcp:prod"],
      "cwd": "/path/to/code-rag"
    }
  }
}
```

### Environment Variables

The MCP server uses the same `.env` file as the REST API:

- Change `MODEL` to use different Ollama models
- Adjust `TOP_K_RESULTS` for default retrieval limits
- Modify `CHUNK_SIZE` for different document chunking

## FAQ

**Q: Can I use MCP server and REST API together?**
A: Yes! They're independent and can run simultaneously.

**Q: How do I update the indexed documents?**
A: Add files to `./docs/` and restart the MCP server, or use the reindex endpoint in REST API.

**Q: What models are supported?**
A: Any Ollama model. Set `MODEL` in `.env` (e.g., `llama3`, `mistral`, `codellama`).

**Q: Can I use this with other AI tools?**
A: Yes! Any tool supporting MCP can use this server.

**Q: How do I debug MCP issues?**
A: Check `./logs/combined.log` for detailed logs. Set `LOG_LEVEL=debug` in `.env` for more details.

## Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [Cursor MCP Guide](https://cursor.sh/docs/mcp)
- [Claude Desktop MCP](https://claude.ai/docs/mcp)

## Support

If you encounter issues:

1. Check this README
2. Review logs in `./logs/`
3. Test REST API first (`npm run dev`)
4. Verify Ollama is working
5. Open an issue on GitHub

---

**Happy coding with RAG-powered AI assistance! 🚀**

