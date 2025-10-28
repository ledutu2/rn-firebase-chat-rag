# 🚀 Quick Reference Card

## One-Command Start

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start RAG System
npm run dev
```

## Essential URLs

| Interface | URL |
|-----------|-----|
| 💬 Chat UI | http://localhost:3000 |
| 📚 API Docs | http://localhost:3000/api-docs |
| 📊 Status | http://localhost:3000/api/status |

## Common Commands

```bash
# Development
npm run dev              # Start with hot reload
npm run build            # Compile TypeScript
npm start                # Run production server

# MCP Server
npm run mcp              # Development MCP server
npm run mcp:prod         # Production MCP server (after build)

# Utilities
npm run clean            # Clean build files
```

## API Quick Test

```bash
# Status
curl http://localhost:3000/api/status

# Retrieve
curl -X POST http://localhost:3000/api/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query":"test","limit":3}'

# Generate
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"query":"What is this?"}'

# Stream
curl -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"query":"Hello"}'

# Reindex
curl -X POST http://localhost:3000/api/status/reindex
```

## File Locations

```
📁 Documents to index → ./docs/*.md
📁 Logs              → ./logs/combined.log
📁 Vector DB         → ./data/lancedb/
📁 Web interface     → ./public/
📁 Configuration     → .env
```

## Environment Variables

```env
# Core Settings
PORT=3000                                    # Server port
MODEL=llama3                                 # Ollama model
OLLAMA_BASE_URL=http://localhost:11434     # Ollama URL
EMBEDDING_MODEL=Xenova/bge-base-en-v1.5    # Embedding model

# RAG Settings
TOP_K_RESULTS=5        # Results to retrieve
CHUNK_SIZE=1000        # Document chunk size
CHUNK_OVERLAP=200      # Chunk overlap

# Advanced
LOG_LEVEL=info         # Logging level (debug, info, warn, error)
NODE_ENV=development   # Environment
```

## MCP Setup (Cursor)

**Config file:** `~/.config/cursor/mcp.json`

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

**Steps:**
1. `npm run build`
2. Edit config (use your actual path!)
3. Restart Cursor
4. Test: "Use RAG retrieve tool to find X"

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect to Ollama | `ollama serve` in another terminal |
| No documents found | Add `.md` files to `./docs/` |
| Port in use | Change `PORT` in `.env` |
| Model not found | `ollama pull llama3` |
| TypeScript errors | `npm install` |

## Project Structure

```
src/
├── index.ts           # Main server
├── rag/
│   ├── pipeline.ts    # RAG orchestrator
│   ├── embedder.ts    # Embeddings
│   ├── vectorStore.ts # Vector DB
│   ├── loader.ts      # Document loader
│   ├── retriever.ts   # Search
│   └── generator.ts   # LLM
├── api/
│   ├── retrieve.ts    # /api/retrieve
│   ├── generate.ts    # /api/generate
│   ├── chat.ts        # /api/chat/stream
│   └── status.ts      # /api/status
├── config/
│   ├── logger.ts      # Winston
│   ├── modelConfig.ts # Config
│   └── swagger.ts     # API docs
└── mcp/
    └── server.ts      # MCP server
```

## Component Flow

```
User Query
    ↓
Embedder (convert to vector)
    ↓
VectorStore (similarity search)
    ↓
Retriever (get top-k docs)
    ↓
Generator (LLM with context)
    ↓
Response
```

## Key Features

- ✅ Local LLM (no API keys needed)
- ✅ Semantic search with embeddings
- ✅ Streaming responses
- ✅ REST API + Web UI + MCP
- ✅ TypeScript strict mode
- ✅ Production ready

## Useful Tips

1. **First time slow?** Embedding model downloads (~100MB)
2. **Add documents:** Copy `.md` files to `./docs/`
3. **Reindex:** Call `/api/status/reindex` or restart
4. **Check logs:** `tail -f logs/combined.log`
5. **Test API:** Use Swagger UI at `/api-docs`
6. **Change model:** Edit `MODEL` in `.env`

## Performance Tips

- Use smaller models for faster responses
- Reduce `TOP_K_RESULTS` for faster retrieval
- Increase `CHUNK_SIZE` for fewer chunks
- Clear data directory to start fresh

## Development Tips

```bash
# Watch logs in real-time
tail -f logs/combined.log

# Clear vector database
rm -rf data/lancedb

# Test with curl
alias rag-status='curl http://localhost:3000/api/status'
alias rag-retrieve='curl -X POST http://localhost:3000/api/retrieve -H "Content-Type: application/json" -d'

# Use with alias
rag-retrieve '{"query":"test"}'
```

## Example Questions

Once documents are indexed, try:
- "What is this system about?"
- "How do I get started?"
- "What are the main features?"
- "Explain the architecture"

## Production Checklist

- [ ] Build: `npm run build`
- [ ] Test all endpoints
- [ ] Configure `.env` for production
- [ ] Set `NODE_ENV=production`
- [ ] Use process manager (PM2)
- [ ] Set up reverse proxy
- [ ] Configure SSL/TLS
- [ ] Set up monitoring
- [ ] Configure firewall

## Support Files

- 📖 `README.md` - Complete documentation
- 🚀 `SETUP.md` - Step-by-step setup
- 🔌 `src/mcp/README.md` - MCP guide
- 📊 `PROJECT_SUMMARY.md` - What was built
- ⚡ `QUICK_REFERENCE.md` - This file

## Need Help?

1. Check README.md
2. Review logs
3. Test REST API first
4. Verify Ollama is running
5. Check documents are in `./docs/`

---

**Remember:** Start Ollama first, then the RAG system!

```bash
# Terminal 1
ollama serve

# Terminal 2
npm run dev

# Browser
http://localhost:3000
```

**You're all set! 🎉**

