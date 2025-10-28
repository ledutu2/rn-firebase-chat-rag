# 🚀 Quick Setup Guide

Follow these steps to get your RAG system up and running in minutes!

## Step 1: Install Ollama

### macOS/Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Windows
Download from https://ollama.ai

### Verify Installation
```bash
ollama --version
```

## Step 2: Install and Start Llama3

```bash
# Pull the model (this may take a few minutes)
ollama pull llama3

# Start Ollama server (keep this running)
ollama serve
```

**Note**: Keep this terminal window open! Ollama must be running for the RAG system to work.

## Step 3: Install Node Dependencies

```bash
# Install all required packages
npm install
```

This will install:
- Express.js for the REST API
- LangChain for RAG functionality
- LanceDB for vector storage
- Xenova Transformers for embeddings
- Ollama client for LLM access
- And many more...

## Step 4: Configure Environment (Optional)

The `.env` file is already configured with sensible defaults. You can modify it if needed:

```bash
# Edit .env if you want to change settings
nano .env
```

Common changes:
- `PORT=3000` - Change server port
- `MODEL=llama3` - Use different Ollama model
- `TOP_K_RESULTS=5` - Number of results to retrieve

## Step 5: Start the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
# Build first
npm run build

# Then start
npm start
```

## Step 6: Verify It's Working

### Check System Status
Open a new terminal and run:
```bash
curl http://localhost:3000/api/status
```

You should see:
```json
{
  "documentCount": 1,
  "isInitialized": true,
  "availableComponents": [],
  "configuration": {...}
}
```

### Open the Web Interface
Open your browser and go to:
```
http://localhost:3000
```

Try asking: "What is this RAG system?"

### Check API Documentation
```
http://localhost:3000/api-docs
```

## Step 7: Add Your Own Documents

1. Add markdown files to the `docs/` directory:
```bash
echo "# My Document\n\nThis is my content." > docs/my-doc.md
```

2. Reindex the documents:
```bash
curl -X POST http://localhost:3000/api/status/reindex
```

Or restart the server to auto-index.

## Setup MCP Server (Optional)

To use the RAG system in Cursor:

### 1. Build the Project
```bash
npm run build
```

### 2. Configure Cursor

Add to your Cursor MCP config (`~/.config/cursor/mcp.json`):

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

**Important**: Replace the `cwd` path with your actual project path!

### 3. Restart Cursor

Completely quit and restart Cursor.

### 4. Test in Cursor

In a Cursor chat, type:
```
Use the RAG retrieve tool to find information about "getting started"
```

## Troubleshooting

### "Failed to connect to Ollama"

**Problem**: Ollama is not running
**Solution**: 
```bash
ollama serve
```
Keep this running in a separate terminal.

### "No documents found"

**Problem**: No markdown files in docs/
**Solution**: 
```bash
# Add some documents
cp /path/to/your/docs/*.md docs/
# Restart server or reindex
```

### Port 3000 already in use

**Problem**: Another app is using port 3000
**Solution**: Change `PORT` in `.env` to a different number like 3001

### Model download issues

**Problem**: Embedding model fails to download
**Solution**: 
- Check internet connection
- The model (~100MB) downloads on first use
- Wait for complete download
- Check disk space (need ~2GB)

### TypeScript errors

**Problem**: TypeScript compilation fails
**Solution**:
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

## Quick Test Commands

```bash
# Test status
curl http://localhost:3000/api/status

# Test retrieval
curl -X POST http://localhost:3000/api/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "getting started", "limit": 3}'

# Test generation
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "What is this system?"}'

# Test streaming
curl -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain the features"}'
```

## Next Steps

1. ✅ Add your documentation to `docs/`
2. ✅ Customize settings in `.env`
3. ✅ Try the web interface
4. ✅ Test the API endpoints
5. ✅ Set up MCP for Cursor integration
6. ✅ Monitor logs in `logs/` directory
7. ✅ Read the README.md for advanced usage

## Useful Commands

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Start MCP server
npm run mcp

# View logs
tail -f logs/combined.log

# Clear data and start fresh
rm -rf data/lancedb
npm run dev
```

## Getting Help

- 📖 Read the [README.md](README.md)
- 🔌 Check [MCP Setup Guide](src/mcp/README.md)
- 📊 Monitor logs in `logs/combined.log`
- 🐛 Open an issue on GitHub

## Success Checklist

- [ ] Ollama installed and running
- [ ] Llama3 model downloaded
- [ ] Node dependencies installed
- [ ] Server starts without errors
- [ ] Status endpoint returns `isInitialized: true`
- [ ] Web interface loads
- [ ] Can ask questions and get responses
- [ ] Documents are being indexed

If all boxes are checked, you're ready to go! 🎉

---

**Need help? Check the README.md or open an issue!**

