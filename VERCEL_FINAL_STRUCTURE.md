# Vercel MCP Server - Final Structure

## ✅ Simplified Single-File Structure

We've consolidated everything into **one file** to avoid duplication.

```
rn-firebase-chat-rag/
├── api/
│   └── mcp/
│       └── index.ts          # ✅ Single MCP handler file
│
├── src/
│   ├── api/                  # Express API handlers (separate)
│   │   ├── chat.ts
│   │   ├── generate.ts
│   │   ├── retrieve.ts
│   │   └── status.ts
│   ├── rag/                  # RAG pipeline (shared by both)
│   └── mcp/
│       └── server.ts         # Stdio MCP server (for local Cursor)
│
└── vercel.json               # Vercel configuration
```

## 🎯 Key Points

### One File, Two Purposes

**File:** `api/mcp/index.ts`

This single file serves as:
1. ✅ **Vercel API Route** - Deployed as serverless function
2. ✅ **MCP Handler** - Implements Model Context Protocol

### Why This Structure?

✅ **No Duplication** - Single source of truth
✅ **Vercel Convention** - Files in `api/` are auto-deployed
✅ **Clean Separation** - Express API in `src/api/`, Vercel API in `api/`
✅ **TypeScript Native** - Vercel compiles `.ts` files automatically

## 🚀 How It Works

### 1. Development
```bash
# Edit the file
vim api/mcp/index.ts

# Build (optional for local testing)
npm run build
```

### 2. Deployment
```bash
# Deploy to Vercel
vercel --prod
```

Vercel automatically:
- Detects `api/mcp/index.ts`
- Compiles TypeScript
- Creates serverless function
- Exposes at `/api/mcp`

### 3. Access
```
https://your-project.vercel.app/api/mcp
```

## 📝 File Content Overview

### `api/mcp/index.ts`

```typescript
// 1. Imports
import { createMcpHandler } from 'mcp-handler';
import { RAGPipeline } from '../../src/rag/pipeline.js';

// 2. RAG Pipeline Initialization (cached)
let ragPipeline: RAGPipeline | null = null;

// 3. MCP Handler with 3 Tools
const handler = createMcpHandler((server) => {
  server.tool('retrieve_context', ...);
  server.tool('search_by_metadata', ...);
  server.tool('get_stats', ...);
});

// 4. Export for Vercel
export { handler as GET, handler as POST, handler as DELETE };
```

## 🔧 Configuration

### `vercel.json`

```json
{
  "version": 2,
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

**Key settings:**
- `api/**/*.ts` - Matches our file
- `nodejs20.x` - Runtime version
- `memory: 1024` - RAM allocation
- `maxDuration: 30` - Timeout (seconds)
- CORS enabled for public access

## 🌐 Public Access

Your MCP server is configured for **public access**:
- ✅ No authentication required
- ✅ CORS enabled (`Access-Control-Allow-Origin: *`)
- ✅ Anyone can use the tools
- ✅ Perfect for open source projects

## 🧪 Testing

### Local Testing
```bash
# Option 1: Vercel dev server
vercel dev

# Option 2: Test script
./test-vercel-local.sh
```

### Test with MCP Inspector
```bash
npx @modelcontextprotocol/inspector@latest http://localhost:3000
```

### After Deployment
```bash
# Test endpoint
curl https://your-project.vercel.app/api/mcp

# Test with inspector
npx @modelcontextprotocol/inspector@latest https://your-project.vercel.app
```

## 📊 Comparison: Before vs After

### Before (Duplicated)
```
src/api/vercel-mcp.ts     ❌ Source file
api/vercel-mcp.js          ❌ Wrapper file
api/mcp/index.ts           ❌ Another copy
```

### After (Single File)
```
api/mcp/index.ts           ✅ One file, everything in it
```

**Benefits:**
- 🎯 No confusion about which file to edit
- 🎯 No risk of files getting out of sync
- 🎯 Simpler to maintain
- 🎯 Follows Vercel conventions

## 🔄 Dual MCP Support

Your project supports **two MCP transports**:

### 1. Stdio (Local)
**File:** `src/mcp/server.ts`
**Use:** Local Cursor/Claude Desktop
**Start:** `npm run mcp:prod`

### 2. HTTP (Vercel)
**File:** `api/mcp/index.ts`
**Use:** Cloud deployment
**Deploy:** `vercel --prod`

Both share the same RAG pipeline from `src/rag/`!

## 📚 Quick Reference

| Task | Command |
|------|---------|
| Edit MCP handler | `vim api/mcp/index.ts` |
| Build project | `npm run build` |
| Test locally | `vercel dev` |
| Deploy | `vercel --prod` |
| Test deployed | `curl https://your-project.vercel.app/api/mcp` |

## ✅ Deployment Checklist

- [x] Single file: `api/mcp/index.ts`
- [x] No duplicates
- [x] TypeScript compiles successfully
- [x] Vercel configuration updated
- [x] CORS headers configured
- [x] Public access enabled
- [x] Documentation updated

## 🎉 Ready to Deploy!

Your MCP server is now ready with a clean, single-file structure:

```bash
# Deploy to Vercel
vercel --prod

# Share your URL
https://your-project.vercel.app/api/mcp
```

---

**Simple • Clean • No Duplication** ✨

