# 🧠 RAG System - Production Ready

A complete, production-ready **Retrieval-Augmented Generation (RAG)** system built with TypeScript, LangChain, LanceDB, and Ollama.

This system provides AI-powered document retrieval and question answering through multiple interfaces: REST API, Web UI, and MCP Server integration with Cursor/Claude.

---

## 📊 Current Status

- ✅ **Active MCP Server**: `rn-firebase-chat` 
- ✅ **Primary Documentation**: `rn-firebase-chat` - React Native Firebase Chat Library
- ✅ **Documents Available**: Complete Firebase Chat documentation in `./docs/`
- ✅ **Embedding Model**: Xenova/bge-base-en-v1.5
- ✅ **LLM Model**: Llama3 via Ollama
- ✅ **REST API**: Running on port 3000
- ✅ **MCP Tools**: retrieve_context, search_by_metadata, get_stats

**📚 Documentation Content:**
- Installation guides (React Native CLI + Expo)
- Firebase setup (Firestore, Storage, Authentication)
- ChatProvider and chat components usage
- Group chat and one-on-one conversations
- Media sharing, encryption, and advanced features
- Troubleshooting and best practices

**🔄 To Add More Documentation:**
1. Add your markdown files to `./docs/` directory
2. Run: `npm start` (auto-reindexes) or `./reinit-database.sh`
3. Restart Cursor (Cmd+Q, reopen) to refresh MCP connection

---

## 🚀 Quick Reference

| What | Command | Documentation |
|------|---------|---------------|
| Start server | `npm start` or `npm run dev` | [Quick Start](#quick-start) |
| Build project | `npm run build` | [Production](#production-deployment) |
| Test MCP | `./test-mcp.sh` | [MCP Setup](#mcp-server-setup) |
| Reset database | `./reinit-database.sh` | [Switching Docs](#switching-documentation) |
| Check status | `curl localhost:3000/api/status` | [API Usage](#api-usage) |
| View logs | `tail -f logs/combined.log` | [Monitoring](#monitoring) |
| API docs | http://localhost:3000/api-docs | [Swagger UI](#5-access-the-interfaces) |
| Chat UI | http://localhost:3000 | [Web Interface](#5-access-the-interfaces) |

**💡 Quick Tips:**
- Add docs to `./docs/*.md` → Server auto-reindexes on start
- Change models in `.env` → `MODEL=llama3` or `mistral`
- MCP not connecting? → Run `./reset-mcp.sh` and restart Cursor
- Wrong docs? → Run `./reinit-database.sh`

---

## ✨ Features

- **📚 Document Indexing**: Automatically indexes markdown files from `./docs/`
- **🔍 Semantic Search**: Fast similarity search using LanceDB vector database
- **🤖 Local LLM**: Uses Llama3 via Ollama for answer generation
- **🌐 REST API**: Full-featured API with Swagger documentation
- **🔌 MCP Server**: Integration with Cursor/Claude via Model Context Protocol
- **💬 Web Interface**: Beautiful chat interface with streaming responses
- **📊 Monitoring**: Status endpoints and comprehensive logging
- **🔒 Production Ready**: Security headers, error handling, graceful shutdown

## 🏗️ Architecture

```
┌─────────────────┐
│  Web UI / API   │
│   (Express)     │
└────────┬────────┘
         │
    ┌────▼────┐
    │   RAG   │
    │Pipeline │
    └────┬────┘
         │
    ┌────┴─────────────────────┐
    │                          │
┌───▼────┐              ┌─────▼──────┐
│Embedder│              │ Generator  │
│(Xenova)│              │  (Ollama)  │
└───┬────┘              └────────────┘
    │
┌───▼──────┐
│VectorStore│
│ (LanceDB)│
└──────────┘
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **Ollama** (for local LLM inference)

### Install Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Or download from https://ollama.ai
```

### Pull Llama3 Model

```bash
ollama pull llama3
```

### Start Ollama Server

```bash
ollama serve
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env` file is already created with default values. Modify if needed:

```env
PORT=3000
MODEL=llama3
OLLAMA_BASE_URL=http://localhost:11434
EMBEDDING_MODEL=Xenova/bge-base-en-v1.5
```

### 3. Add Your Documents

Place your markdown files in the `./docs/` directory:

```bash
# Example: Add some documentation
echo "# Hello World\nThis is a test document." > docs/example.md
```

**Current Content**: The system has `rn-firebase-chat` documentation indexed from `./docs/rn-firebase-chat-doc.md`. You can add additional documentation files as needed.

### 4. Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The server will:
- Initialize the RAG pipeline
- Index all documents from `./docs/`
- Start the REST API on `http://localhost:3000`

### 5. Access the Interfaces

- **💬 Chat Interface**: http://localhost:3000
- **📚 API Documentation**: http://localhost:3000/api-docs
- **📊 System Status**: http://localhost:3000/api/status

### 6. Test the System

```bash
# Get system statistics
curl http://localhost:3000/api/status

# Example query about Firebase Chat
curl -X POST http://localhost:3000/api/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "How to install rn-firebase-chat?", "limit": 3}'
```

## 📖 API Usage

### Retrieve Documents

```bash
curl -X POST http://localhost:3000/api/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "How to setup Firebase for chat?", "limit": 5}'
```

**Response example:**
```json
{
  "query": "How to setup Firebase for chat?",
  "results": [
    {
      "content": "## Firebase Setup\n\n### Step 1: Create Firebase Project\n1. Go to Firebase Console...",
      "metadata": {
        "source": "/path/to/docs/rn-firebase-chat-doc.md",
        "title": "rn-firebase-chat",
        "chunkIndex": 5
      },
      "relevanceScore": 0.91
    },
    {
      "content": "### Firestore Security Rules\n\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /conversations/{conversationId} {...",
      "metadata": {
        "source": "/path/to/docs/rn-firebase-chat-doc.md",
        "title": "Firebase Security Rules",
        "chunkIndex": 8
      },
      "relevanceScore": 0.87
    }
  ],
  "totalResults": 5
}
```

### Generate Answer

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "How to implement group chat?", "topK": 5}'
```

**Response example:**
```json
{
  "answer": "To implement group chat with rn-firebase-chat, you need to use the ChatProvider with customConversationInfo to specify multiple participants. Here's how:\n\n1. Import the ChatProvider component\n2. Set up customConversationInfo with participant IDs\n3. Navigate to the chat screen with the conversation details...",
  "sources": [
    {
      "content": "## Group Chat\n\nFor group conversations, use customConversationInfo...",
      "metadata": {
        "source": "/path/to/docs/rn-firebase-chat-doc.md",
        "title": "Group Chat Usage"
      },
      "relevanceScore": 0.92
    }
  ],
  "query": "How to implement group chat?"
}
```

### Stream Chat Response

```bash
curl -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"query": "How to enable message encryption?"}'
```

Returns Server-Sent Events (SSE) stream with real-time response chunks:
```
data: {"chunk": "To enable message encryption in rn-firebase-chat"}
data: {"chunk": ", you need to set the encryption props in"}
data: {"chunk": " ChatProvider. Add enableEncryption={true}"}
data: {"chunk": " and provide an encryption key..."}
data: {"done": true}
```

### Check System Status

```bash
curl http://localhost:3000/api/status
```

### Reindex Documents

```bash
curl -X POST http://localhost:3000/api/status/reindex
```

## 🔌 MCP Server Setup

The MCP (Model Context Protocol) server allows integration with Cursor and Claude Desktop.

### 1. Build the Project

```bash
npm run build
```

### 2. Configure Cursor

**Automatic Configuration (Recommended):**

The MCP server is already configured in Cursor if you see `rn-firebase-chat` in your MCP panel.

**Manual Configuration:**

If not configured, add to `~/.cursor/mcp.json` (macOS) or Cursor settings:

```json
{
  "mcpServers": {
    "rn-firebase-chat": {
      "command": "npm",
      "args": ["run", "mcp:prod"],
      "cwd": "/Users/tungle/saigontechnology/rn-firebase-chat-rag"
    }
  }
}
```

⚠️ **Important**: Update the `cwd` path to match your actual project directory.

### 3. Restart Cursor

After configuration, restart Cursor completely (Cmd+Q on macOS, then reopen).

### 4. Verify Connection

In Cursor:
1. Open the MCP panel
2. Look for `rn-firebase-chat` server (should show "connected")
3. Try asking: "How do I install rn-firebase-chat?"

### 5. Available MCP Tools

The MCP server provides these tools for AI-powered documentation access:

#### `mcp_rn-firebase-chat_retrieve_context`
Retrieve relevant documentation based on semantic search.

**Parameters:**
- `question` (string): Your question or query
- `limit` (number, optional): Number of results (1-20, default: 5)

**Example:**
```
In Cursor chat: "How do I setup Firebase for chat?"
→ AI will use retrieve_context to find Firebase setup documentation
```

#### `mcp_rn-firebase-chat_search_by_metadata`
Search by specific metadata filters (filename, section, etc.).

**Parameters:**
- `filters` (object): Key-value pairs to filter
- `limit` (number, optional): Max results (1-100, default: 10)

**Example:**
```
In Cursor chat: "Show me all Firebase security rules"
→ AI will use search_by_metadata with {"title": "Firebase Security Rules"}
```

#### `mcp_rn-firebase-chat_get_stats`
Get system statistics and configuration.

**Example:**
```
In Cursor chat: "How many documents are indexed?"
→ AI will use get_stats to report current status
```

### 6. Usage in Cursor

The MCP tools are automatically available to Claude in Cursor. Just ask questions naturally:

- "How do I install rn-firebase-chat?"
- "What are the Firebase security rules for chat?"
- "How to implement group chat?"
- "How to enable message encryption?"
- "Show me ChatProvider usage examples"

Claude will automatically use the MCP tools to retrieve relevant documentation and provide accurate answers.

**📖 Detailed Guide**: See [`src/mcp/README.md`](./src/mcp/README.md) for complete MCP documentation.

## 🔄 Managing Documentation

The system is flexible and can index any markdown documentation. Currently, it has `rn-firebase-chat` documentation indexed.

### Adding More Documentation

1. **Add files to `./docs/`:**
```bash
# Add your markdown files (they will be indexed alongside rn-firebase-chat docs)
cp /path/to/your/docs/*.md ./docs/
```

2. **Reindex the database:**
```bash
./reinit-database.sh
# or
npm start  # Auto-reindexes on startup if database doesn't exist
```

3. **Restart Cursor:**
```bash
# Quit Cursor completely (Cmd+Q on macOS)
# Wait 5 seconds
# Reopen Cursor
```

4. **Verify:**
```bash
# Check updated document count
curl http://localhost:3000/api/status

# Test retrieval with your new content
curl -X POST http://localhost:3000/api/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "your specific query", "limit": 3}'
```

### Replacing Documentation

To replace the current documentation entirely:

1. **Clear the docs directory:**
```bash
# Backup current docs if needed
mv docs/rn-firebase-chat-doc.md docs/rn-firebase-chat-doc.md.backup

# Add your new documentation
cp /path/to/your/new-docs/*.md ./docs/
```

2. **Reinitialize database:**
```bash
rm -rf ./data/lancedb
npm start
```

3. **Restart Cursor** to refresh the MCP connection

### Documentation Format Tips

For best RAG retrieval results:

- ✅ Use clear, descriptive headings (H2, H3)
- ✅ Keep sections focused and self-contained
- ✅ Include code examples with context
- ✅ Use consistent terminology
- ✅ Add metadata comments if needed
- ❌ Avoid extremely long sections (>2000 chars)
- ❌ Don't split code examples across chunks

## 📁 Project Structure

```
rn-firebase-chat-rag/
├── src/
│   ├── index.ts                 # Express server
│   ├── rag/
│   │   ├── pipeline.ts         # RAG orchestrator
│   │   ├── embedder.ts         # Embedding generation
│   │   ├── vectorStore.ts      # LanceDB wrapper
│   │   ├── loader.ts           # Document loading
│   │   ├── retriever.ts        # Similarity search
│   │   └── generator.ts        # LLM generation
│   ├── api/
│   │   ├── retrieve.ts         # Retrieve endpoint
│   │   ├── generate.ts         # Generate endpoint
│   │   ├── chat.ts             # Streaming chat
│   │   └── status.ts           # Status endpoints
│   ├── config/
│   │   ├── logger.ts           # Winston logger
│   │   ├── modelConfig.ts      # Configuration
│   │   └── swagger.ts          # API docs
│   └── mcp/
│       ├── server.ts           # MCP server
│       └── README.md           # MCP guide
├── public/
│   ├── index.html              # Chat UI
│   └── app.js                  # Frontend logic
├── docs/                       # Your documentation
├── data/                       # LanceDB storage
├── logs/                       # Application logs
├── .env                        # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `MODEL` | Ollama model name | `llama3` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `EMBEDDING_MODEL` | Embedding model | `Xenova/bge-base-en-v1.5` |
| `LANCEDB_PATH` | Vector DB path | `./data/lancedb` |
| `VECTOR_DIMENSION` | Embedding dimension | `768` |
| `TOP_K_RESULTS` | Default retrieval limit | `5` |
| `CHUNK_SIZE` | Document chunk size | `1000` |
| `CHUNK_OVERLAP` | Chunk overlap | `200` |
| `LOG_LEVEL` | Logging level | `info` |

## 🧪 Testing

### Test the RAG Pipeline

```bash
# 1. Check system status
curl http://localhost:3000/api/status

# 2. Test retrieval
curl -X POST http://localhost:3000/api/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "test query"}'

# 3. Test generation
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "test question"}'
```

### Test the Web Interface

1. Open http://localhost:3000
2. Type a question in the chat
3. Press Enter or click Send
4. Watch the streaming response

## 📊 Monitoring

### Logs

Logs are written to:
- `./logs/combined.log` - All logs
- `./logs/error.log` - Error logs only
- Console (development mode only)

### Status Endpoint

```bash
curl http://localhost:3000/api/status
```

Returns:
```json
{
  "documentCount": 43,
  "isInitialized": true,
  "availableComponents": [],
  "configuration": {
    "embeddingModel": "Xenova/bge-base-en-v1.5",
    "model": "llama3",
    "topKResults": 5,
    "chunkSize": 1000,
    "chunkOverlap": 200
  }
}
```

**Note**: `documentCount` shows the number of indexed chunks. The `availableComponents` array is populated when component documentation includes specific metadata tags.

## 🐛 Troubleshooting

### Ollama Connection Error

**Error**: `Failed to connect to Ollama`

**Solution**:
1. Ensure Ollama is running: `ollama serve`
2. Check the model is installed: `ollama list`
3. Pull the model if needed: `ollama pull llama3`
4. Verify the base URL in `.env`

### No Documents Found

**Error**: `No documents to index`

**Solution**:
1. Check that markdown files exist in `./docs/` directory:
   ```bash
   ls -la ./docs/
   ```
2. Verify file permissions (files should be readable)
3. Check that files have `.md` extension
4. Restart the server or call reindex endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/status/reindex
   ```

### Wrong Documentation Being Served

**Issue**: MCP server returns different documentation than what's in `./docs/`

**Solution**:
This happens when the database was indexed with different documentation. To fix:

1. Delete the current database:
   ```bash
   rm -rf ./data/lancedb
   ```

2. Restart the server (it will auto-reindex from `./docs/`):
   ```bash
   npm start
   ```

3. Verify the change:
   ```bash
   curl http://localhost:3000/api/status
   # Check documentCount and availableComponents
   ```

4. Restart Cursor completely (Cmd+Q, reopen) to refresh MCP connection

### Embedding Model Download Issues

**Error**: Model download fails

**Solution**:
1. Check internet connection
2. The model will download on first use (~100MB)
3. Wait for download to complete
4. Check disk space (~2GB recommended)

### Port Already in Use

**Error**: `Port 3000 already in use`

**Solution**:
1. Find and kill the process:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Or change PORT in .env
   PORT=3001
   ```
2. Restart the server

### MCP Server Not Connected in Cursor

**Issue**: MCP server not showing as "connected" in Cursor

**Solutions**:

1. **Verify configuration:**
   ```bash
   cat ~/.cursor/mcp.json
   # Check that rn-firebase-chat server is configured
   ```

2. **Check build exists:**
   ```bash
   ls -la dist/mcp/server.js
   # If missing, run: npm run build
   ```

3. **Test MCP manually:**
   ```bash
   npm run mcp
   # Should show initialization logs
   ```

4. **Check logs:**
   ```bash
   tail -f logs/combined.log
   # Look for errors during MCP startup
   ```

5. **Reset MCP:**
   ```bash
   ./reset-mcp.sh
   # Then restart Cursor completely
   ```

6. **Verify Cursor restart:**
   - Must completely quit (Cmd+Q, not just close window)
   - Wait 5 seconds before reopening
   - Check MCP panel for connection status

## 🚢 Production Deployment

### Build for Production

```bash
npm run build
```

### Run in Production

```bash
NODE_ENV=production node dist/index.js
```

### PM2 (Recommended)

```bash
npm install -g pm2

# Start
pm2 start dist/index.js --name rag-system

# View logs
pm2 logs rag-system

# Monitor
pm2 monit

# Stop
pm2 stop rag-system
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

## 🔐 Security

- ✅ Helmet for security headers
- ✅ CORS configured
- ✅ Input validation on all endpoints
- ✅ Error sanitization in production
- ✅ No secrets in code (use `.env`)

## 📈 Performance

- **Retrieval**: < 2 seconds
- **Generation**: < 5 seconds (depends on LLM)
- **Concurrent requests**: Supported
- **Streaming**: Real-time response streaming
- **Database**: LanceDB (fast vector search)
- **Embeddings**: Cached after first generation

## 🛠️ Utility Scripts

The repository includes several helper scripts in the root directory:

### `reinit-database.sh`
Reinitializes the vector database from scratch.

```bash
./reinit-database.sh
```

**What it does:**
1. Deletes existing LanceDB database
2. Starts the server (auto-reindexes from `./docs/`)
3. Shows the new document count

**When to use:**
- After adding/removing files in `./docs/`
- When switching documentation sets
- If retrieval results seem incorrect

### `reset-mcp.sh`
Resets the MCP server connection.

```bash
./reset-mcp.sh
```

**What it does:**
1. Rebuilds the TypeScript project
2. Shows instructions for restarting Cursor
3. Provides test commands

**When to use:**
- MCP server not showing as connected
- After code changes to MCP server
- When troubleshooting MCP issues

### `test-mcp.sh`
Tests the MCP server manually.

```bash
./test-mcp.sh
```

**What it does:**
1. Runs the MCP server in development mode
2. Shows initialization logs
3. Helps verify server is working

**When to use:**
- Debugging MCP server issues
- Verifying configuration
- Before reporting bugs

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📊 Project Stats

- **Lines of Code**: ~2,500+ (TypeScript)
- **Components**: 7 core RAG components
- **API Endpoints**: 6 REST endpoints
- **MCP Tools**: 3 tools for AI integration
- **Current Database**: ~43 chunks of rn-firebase-chat documentation
- **Documentation**: Installation, Firebase setup, usage examples, troubleshooting
- **Supported Models**: Any Ollama model (llama3, mistral, codellama, etc.)
- **License**: MIT

## 🎯 Use Cases

This RAG system is perfect for:

1. **Documentation AI Assistant**: Index your project docs and ask questions
2. **Code Knowledge Base**: Search through code documentation
3. **Technical Support**: Automated answers from documentation
4. **Cursor/Claude Integration**: AI-powered development with MCP
5. **Learning Assistant**: Study from indexed educational materials
6. **API Documentation Search**: Fast, semantic API reference lookup

## 📚 Additional Resources

- **Main Docs**: This README
- **MCP Guide**: [`src/mcp/README.md`](./src/mcp/README.md) - Complete MCP documentation
- **Testing**: [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) - Test queries and expected results
- **Optimization**: [`DOCUMENTATION_OPTIMIZATION_REPORT.md`](./DOCUMENTATION_OPTIMIZATION_REPORT.md)
- **Quick Start**: [`QUICK_START_AFTER_OPTIMIZATION.md`](./QUICK_START_AFTER_OPTIMIZATION.md)
- **Troubleshooting**: [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with these amazing open-source projects:

- [LangChain.js](https://js.langchain.com/) - RAG framework and document processing
- [LanceDB](https://lancedb.github.io/lancedb/) - High-performance vector database
- [Ollama](https://ollama.ai/) - Local LLM inference (supports 50+ models)
- [Xenova/Transformers.js](https://huggingface.co/docs/transformers.js) - Client-side ML embeddings
- [Model Context Protocol](https://modelcontextprotocol.io/) - AI tool integration standard
- [Express.js](https://expressjs.com/) - Web server framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development

## 📞 Support

### Getting Help

1. **Check Documentation**: Review this README and `src/mcp/README.md`
2. **Review Logs**: Check `./logs/combined.log` for errors
3. **Test Components**: Use curl commands to test each component
4. **Search Issues**: Look through existing GitHub issues
5. **Open Issue**: Create a new issue with logs and error details

### Common Issues

| Issue | Solution | Documentation |
|-------|----------|---------------|
| Ollama not connecting | `ollama serve` | [Troubleshooting](#ollama-connection-error) |
| MCP not connected | `./reset-mcp.sh` | [MCP Troubleshooting](#mcp-server-not-connected-in-cursor) |
| Wrong docs served | `./reinit-database.sh` | [Switching Docs](#switching-documentation) |
| Port in use | Change PORT in `.env` | [Port Issues](#port-already-in-use) |

### Quick Diagnostics

```bash
# Check system status
curl http://localhost:3000/api/status

# Check Ollama
ollama list
curl http://localhost:11434/api/tags

# Check logs
tail -f logs/combined.log

# Check database
ls -la data/lancedb/

# Check docs
ls -la docs/
```

---

**Built with ❤️ using TypeScript, LangChain, and Ollama**

**Ready to power your AI with intelligent document retrieval! 🚀**

