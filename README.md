# 🧠 RAG System - Production Ready

A complete, production-ready **Retrieval-Augmented Generation (RAG)** system built with TypeScript, LangChain, LanceDB, and Ollama.

---

## 🎉 NEW: Documentation Optimized! (2025-10-28)

**The documentation has been completely optimized for better RAG retrieval!**

- ✅ **43 chunks** of actual `rn-firebase-chat` library documentation
- ✅ **Installation guides** (React Native + Expo)
- ✅ **Firebase setup** (8-step complete guide with security rules)
- ✅ **Usage examples** (ChatProvider, ChatScreen, Group Chat)
- ✅ **Troubleshooting** and best practices

**📚 Read the optimization details:**
- **Start here**: [`QUICK_START_AFTER_OPTIMIZATION.md`](./QUICK_START_AFTER_OPTIMIZATION.md)
- **Full report**: [`DOCUMENTATION_OPTIMIZATION_REPORT.md`](./DOCUMENTATION_OPTIMIZATION_REPORT.md)
- **Before/After**: [`BEFORE_AFTER_COMPARISON.md`](./BEFORE_AFTER_COMPARISON.md)
- **Testing guide**: [`TESTING_GUIDE.md`](./TESTING_GUIDE.md)

**⚠️ Action Required**: Restart Cursor completely (Cmd+Q, reopen) to connect to the new database.

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

## 📖 API Usage

### Retrieve Documents

```bash
curl -X POST http://localhost:3000/api/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "How to use Button?", "limit": 5}'
```

### Generate Answer

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "What is a Button component?", "topK": 5}'
```

### Stream Chat Response

```bash
curl -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain the Button props"}'
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

Add to your Cursor settings (or `~/.config/cursor/mcp.json`):

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

### 3. Start MCP Server

```bash
# Development
npm run mcp

# Production (after build)
npm run mcp:prod
```

### 4. Available Tools

The MCP server provides the following tools:

- **`retrieve_context`**: Retrieve relevant documentation
- **`search_by_metadata`**: Search by metadata filters
- **`get_stats`**: Get system statistics

See `src/mcp/README.md` for detailed usage.

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
  "documentCount": 42,
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
1. Add markdown files to `./docs/` directory
2. Restart the server or call reindex endpoint

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
1. Change `PORT` in `.env`
2. Or kill the process using the port

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

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- [LangChain.js](https://js.langchain.com/) - RAG framework
- [LanceDB](https://lancedb.github.io/lancedb/) - Vector database
- [Ollama](https://ollama.ai/) - Local LLM inference
- [Xenova/Transformers.js](https://huggingface.co/docs/transformers.js) - Embeddings
- [Model Context Protocol](https://modelcontextprotocol.io/) - AI tool integration

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review the logs in `./logs/`

---

**Built with ❤️ using TypeScript, LangChain, and Ollama**

