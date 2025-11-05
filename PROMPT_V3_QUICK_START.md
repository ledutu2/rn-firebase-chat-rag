# 🚀 RAG Prompt v3 - Quick Start Guide

## Overview

This guide helps you quickly get started with the **v3 Battle-Tested RAG Prompt** for your next project.

---

## 📋 What You Get

The v3 prompt provides:

- ✅ **Complete TypeScript implementations** (copy-paste ready)
- ✅ **MCP server integration** (tested with Cursor)
- ✅ **REST API with Swagger** (optional)
- ✅ **Web chat interface** (optional)
- ✅ **Troubleshooting guide** (8+ common issues)
- ✅ **Utility scripts** (database reset, MCP reset, testing)
- ✅ **Performance benchmarks** (real-world data)
- ✅ **Exact dependencies** (tested versions)

---

## 🎯 Choose Your Path

### Path A: Full System (MCP + API + Web UI)
**Time:** 2-3 hours  
**Best for:** Complete documentation system with multiple interfaces

### Path B: MCP Only (Cursor Integration)
**Time:** 1-2 hours  
**Best for:** Cursor/Claude integration, skip REST API

### Path C: API Only (No MCP)
**Time:** 1.5-2 hours  
**Best for:** REST API service, skip MCP complexity

---

## 🚀 Quick Start (Path B - MCP Only)

This is the most common use case for Cursor integration.

### Step 1: Project Setup (5 minutes)

```bash
# Create project
mkdir my-rag-project && cd my-rag-project
npm init -y

# Install dependencies (exact versions from v3 prompt)
npm install @lancedb/lancedb@^0.19.1 \
  @langchain/community@^0.3.18 \
  @langchain/core@^0.3.24 \
  @modelcontextprotocol/sdk@^1.0.4 \
  @xenova/transformers@^2.17.2 \
  apache-arrow@^18.1.0 \
  dotenv@^16.4.7 \
  langchain@^0.3.7 \
  winston@^3.17.0

npm install -D @types/node@^22.10.2 \
  tsx@^4.19.2 \
  typescript@^5.7.2

# Create structure
mkdir -p src/{rag,config,mcp} docs logs data

# Create config files
touch .env tsconfig.json .gitignore
```

### Step 2: Configuration (5 minutes)

**File: `.env`**
```env
# Embedding Model
EMBEDDING_MODEL=Xenova/bge-base-en-v1.5

# Vector Database
LANCEDB_PATH=./data/lancedb
VECTOR_DIMENSION=768

# RAG Configuration
TOP_K_RESULTS=5
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

**File: `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**File: `package.json`** (add these scripts)
```json
{
  "type": "module",
  "scripts": {
    "mcp": "MCP_SERVER=true npx tsx src/mcp/server.ts",
    "mcp:prod": "MCP_SERVER=true node dist/mcp/server.js",
    "build": "tsc"
  }
}
```

**File: `.gitignore`**
```
node_modules/
dist/
data/
logs/
.env
*.log
```

### Step 3: Copy Implementation Files (30 minutes)

Open the **v3 prompt** (`rag-init-prompt-v3-battle-tested.md`) and copy these files:

**Required files (in order):**
1. `src/config/modelConfig.ts` - Configuration management
2. `src/config/logger.ts` - MCP-aware logging
3. `src/rag/loader.ts` - Document loading
4. `src/rag/embedder.ts` - Embedding generation
5. `src/rag/vectorStore.ts` - LanceDB wrapper
6. `src/rag/retriever.ts` - Similarity search
7. `src/rag/pipeline.ts` - RAG orchestrator
8. `src/mcp/server.ts` - MCP server (⭐ CRITICAL)

**💡 Tip:** Copy the complete implementations from the v3 prompt. They're ready to use.

### Step 4: Add Your Documentation (5 minutes)

```bash
# Add your markdown files
cp /path/to/your/docs/*.md ./docs/

# Or create a sample
cat > docs/example.md << 'EOF'
# Getting Started

This is sample documentation for testing the RAG system.

## Features

- Semantic search
- Vector embeddings
- LanceDB storage

## Usage

Simply add your markdown files to the docs directory.
EOF
```

### Step 5: Build & Test (10 minutes)

```bash
# Build TypeScript
npm run build

# Test MCP server manually
npm run mcp
# Should show initialization logs
# Press Ctrl+C to stop
```

**Expected output:**
```
[INFO] Starting RAG Pipeline initialization...
[INFO] Initializing embedder with model: Xenova/bge-base-en-v1.5
[INFO] Loading documents from /path/to/docs
[INFO] Loaded 1 documents, splitting into chunks...
[INFO] Split into 3 chunks
[INFO] Generating embeddings for 3 texts
[INFO] Successfully indexed 3 documents
[INFO] RAG Pipeline initialized successfully
```

### Step 6: Configure Cursor (5 minutes)

**File: `~/.cursor/mcp.json`** (create if doesn't exist)
```json
{
  "mcpServers": {
    "my-rag-project": {
      "command": "npm",
      "args": ["run", "mcp:prod"],
      "cwd": "/absolute/path/to/my-rag-project"
    }
  }
}
```

⚠️ **IMPORTANT:** Replace `/absolute/path/to/my-rag-project` with your actual project path.

**To find your absolute path:**
```bash
pwd
# Copy the output
```

### Step 7: Restart Cursor (2 minutes)

1. **Quit Cursor completely** (Cmd+Q on macOS, not just close window)
2. **Wait 5 seconds**
3. **Reopen Cursor**
4. **Check MCP panel** (should show "my-rag-project" connected)

### Step 8: Test in Cursor (5 minutes)

In Cursor chat, try these queries:

```
1. "What documentation is available?"
   → Should use get_stats tool

2. "Search for information about features"
   → Should use retrieve_context tool

3. "Show me the getting started guide"
   → Should return relevant chunks
```

**✅ Success!** You now have a working RAG system integrated with Cursor.

---

## 🐛 Quick Troubleshooting

### MCP Not Connecting?

**Check 1: Build exists**
```bash
ls dist/mcp/server.js
# If missing: npm run build
```

**Check 2: Test manually**
```bash
npm run mcp
# Should show logs, not errors
```

**Check 3: Absolute path**
```bash
# In ~/.cursor/mcp.json, verify path is absolute
cat ~/.cursor/mcp.json | grep cwd
```

**Check 4: Cursor restart**
```bash
# Must completely quit (Cmd+Q), not just close
# Wait 5 seconds before reopening
```

### Module Import Errors?

**Error:** `Cannot find module './config/logger'`

**Fix:** Add `.js` extension to ALL imports:
```typescript
// ✅ Correct
import { logger } from './config/logger.js';

// ❌ Wrong
import { logger } from './config/logger';
```

### No Documents Found?

**Check docs directory:**
```bash
ls -la docs/
# Should show .md files
```

**Reinitialize database:**
```bash
rm -rf ./data/lancedb
npm run mcp
```

### Still Having Issues?

1. Check logs: `tail -f logs/combined.log`
2. Review v3 prompt troubleshooting section (8+ issues covered)
3. Check Cursor logs: `~/Library/Logs/Cursor/`

---

## 📚 Next Steps

### Add More Documentation
```bash
# Add more markdown files
cp /path/to/more/docs/*.md ./docs/

# Reinitialize
rm -rf ./data/lancedb
npm run build
# Restart Cursor
```

### Create Utility Scripts

**File: `reinit-database.sh`**
```bash
#!/bin/bash
echo "🗑️  Deleting database..."
rm -rf ./data/lancedb
echo "🚀 Rebuilding..."
npm run build
echo "✅ Done! Restart Cursor to refresh."
```

**File: `reset-mcp.sh`**
```bash
#!/bin/bash
echo "🔨 Building..."
npm run build
echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Quit Cursor (Cmd+Q)"
echo "2. Wait 5 seconds"
echo "3. Reopen Cursor"
```

Make executable:
```bash
chmod +x reinit-database.sh reset-mcp.sh
```

### Customize MCP Tools

Edit `src/mcp/server.ts` to add custom tools:

```typescript
{
  name: 'my_custom_tool',
  description: 'Does something specific',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string' }
    },
    required: ['param']
  }
}
```

---

## 🎯 Success Checklist

- [ ] Project created with correct structure
- [ ] Dependencies installed (exact versions)
- [ ] Configuration files created (.env, tsconfig.json)
- [ ] All 8 implementation files copied
- [ ] Documentation added to ./docs/
- [ ] TypeScript compiles (npm run build)
- [ ] MCP server runs manually (npm run mcp)
- [ ] MCP config added to ~/.cursor/mcp.json
- [ ] Absolute path verified in config
- [ ] Cursor restarted completely
- [ ] MCP shows "connected" in Cursor
- [ ] Test queries work in Cursor chat

---

## 📊 Time Breakdown

| Step | Time | Cumulative |
|------|------|------------|
| Project setup | 5 min | 5 min |
| Configuration | 5 min | 10 min |
| Copy files | 30 min | 40 min |
| Add docs | 5 min | 45 min |
| Build & test | 10 min | 55 min |
| Configure Cursor | 5 min | 60 min |
| Restart Cursor | 2 min | 62 min |
| Test in Cursor | 5 min | 67 min |
| **Total** | **~70 min** | **1-1.5 hours** |

---

## 💡 Pro Tips

### 1. Start Small
- Begin with 1-2 markdown files
- Test retrieval works
- Then add more documentation

### 2. Test Incrementally
- Test each component individually
- Don't wait until the end
- Fix issues as you go

### 3. Use Utility Scripts
- Create helper scripts early
- Saves time on repetitive tasks
- Reduces manual errors

### 4. Check Logs
- Logs are in `./logs/combined.log`
- Check after each step
- Catch issues early

### 5. Keep v3 Prompt Open
- Reference troubleshooting section
- Copy additional features as needed
- Use as implementation guide

---

## 🔄 Common Workflows

### Workflow 1: Update Documentation
```bash
# 1. Add new markdown files
cp /path/to/new/docs/*.md ./docs/

# 2. Reinitialize database
./reinit-database.sh

# 3. Restart Cursor
# Cmd+Q, wait, reopen
```

### Workflow 2: Fix MCP Issues
```bash
# 1. Rebuild project
./reset-mcp.sh

# 2. Test manually
npm run mcp

# 3. Check logs
tail -f logs/combined.log

# 4. Restart Cursor
```

### Workflow 3: Add New Features
```bash
# 1. Edit source files
# (e.g., add new MCP tool)

# 2. Rebuild
npm run build

# 3. Test
npm run mcp

# 4. Restart Cursor
```

---

## 📞 Getting Help

### Resources (in order of usefulness)

1. **v3 Prompt Troubleshooting Section**
   - 8+ common issues with solutions
   - Step-by-step debugging

2. **Project Logs**
   - `./logs/combined.log` - All logs
   - `./logs/error.log` - Errors only

3. **Manual Testing**
   - `npm run mcp` - Test MCP server
   - Check for error messages

4. **Cursor Logs**
   - macOS: `~/Library/Logs/Cursor/`
   - Check for MCP connection errors

5. **Community**
   - GitHub issues
   - Stack Overflow
   - Discord/Slack communities

---

## 🎉 You're Ready!

You now have:
- ✅ Working RAG system
- ✅ Cursor/MCP integration
- ✅ Semantic document search
- ✅ Troubleshooting knowledge
- ✅ Utility scripts

**Next project?** Just follow this guide again. Takes ~1 hour with practice.

---

## 📚 Additional Resources

- **Full v3 Prompt:** `rag-init-prompt-v3-battle-tested.md`
- **Comparison:** `PROMPT_OPTIMIZATION_COMPARISON.md`
- **This Guide:** `PROMPT_V3_QUICK_START.md`

---

**Happy RAG building! 🚀**

**Questions?** Review the v3 prompt's troubleshooting section first.

