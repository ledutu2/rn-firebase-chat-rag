# Vercel MCP Server - Project Structure

## 📁 Simplified Structure

The Vercel MCP handler is now organized in the existing `src/api/` directory, keeping everything in one place.

```
rn-firebase-chat-rag/
├── src/
│   └── api/
│       ├── chat.ts              # Express API - Chat endpoint
│       ├── generate.ts          # Express API - Generate endpoint
│       ├── retrieve.ts          # Express API - Retrieve endpoint
│       ├── status.ts            # Express API - Status endpoint
│       └── vercel-mcp.ts        # NEW: Vercel MCP handler
│
├── api/
│   └── vercel-mcp.js            # Vercel API route (imports from dist/)
│
├── dist/
│   └── api/
│       ├── chat.js              # Compiled Express API
│       ├── generate.js
│       ├── retrieve.js
│       ├── status.js
│       └── vercel-mcp.js        # Compiled Vercel MCP handler
│
└── vercel.json                  # Vercel configuration
```

## 🔄 How It Works

### 1. Source Code
**Location:** `src/api/vercel-mcp.ts`

This is the main MCP handler implementation with:
- RAG pipeline initialization
- Three MCP tools (retrieve_context, search_by_metadata, get_stats)
- Error handling
- Public access (no authentication)

### 2. Compilation
**Command:** `npm run build`

TypeScript compiles `src/api/vercel-mcp.ts` → `dist/api/vercel-mcp.js`

### 3. Vercel API Route
**Location:** `api/vercel-mcp.js`

Simple wrapper that imports the compiled handler:
```javascript
export { GET, POST, DELETE } from '../dist/api/vercel-mcp.js';
```

Vercel expects API routes in the `/api` directory at the project root, so this file acts as an entry point.

### 4. URL Mapping
**Configuration:** `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/api/mcp",
      "destination": "/api/vercel-mcp"
    }
  ]
}
```

This maps the clean URL `/api/mcp` to the actual handler at `/api/vercel-mcp`.

## 🌐 Public URL

After deployment:
```
https://your-project.vercel.app/api/mcp
```

## 🛠️ Development Workflow

### 1. Edit Source
```bash
# Edit the MCP handler
vim src/api/vercel-mcp.ts
```

### 2. Build
```bash
# Compile TypeScript
npm run build
```

### 3. Test Locally
```bash
# Test with Vercel dev server
./test-vercel-local.sh

# Or manually
vercel dev
```

### 4. Deploy
```bash
# Deploy to production
vercel --prod
```

## 📦 Why This Structure?

### Benefits

✅ **Organized**: All API handlers in one place (`src/api/`)
✅ **Clean**: No duplicate folders
✅ **Simple**: Easy to understand and maintain
✅ **Flexible**: Can add more Vercel endpoints easily
✅ **Type-safe**: Written in TypeScript with full type checking

### Comparison

**Before (separate api/ folder):**
```
api/
├── mcp/
│   └── index.ts
└── .well-known/
    └── oauth-protected-resource/
        └── index.ts
```

**After (integrated in src/api/):**
```
src/api/
└── vercel-mcp.ts

api/
└── vercel-mcp.js  (just imports from dist/)
```

## 🔧 Adding More Vercel Endpoints

To add a new Vercel API endpoint:

### 1. Create Source File
```typescript
// src/api/my-new-endpoint.ts
export const GET = async (req: Request) => {
  return new Response('Hello from Vercel!');
};
```

### 2. Create Vercel Route
```javascript
// api/my-new-endpoint.js
export { GET } from '../dist/api/my-new-endpoint.js';
```

### 3. Build and Deploy
```bash
npm run build
vercel --prod
```

### 4. Access
```
https://your-project.vercel.app/api/my-new-endpoint
```

## 🚀 Deployment Checklist

- [x] Source code in `src/api/vercel-mcp.ts`
- [x] Vercel route in `api/vercel-mcp.js`
- [x] Configuration in `vercel.json`
- [x] Build command: `npm run build`
- [x] CORS headers configured
- [x] Public access enabled

## 📚 Related Files

| File | Purpose |
|------|---------|
| `src/api/vercel-mcp.ts` | MCP handler source code |
| `api/vercel-mcp.js` | Vercel API route entry point |
| `dist/api/vercel-mcp.js` | Compiled handler |
| `vercel.json` | Vercel configuration |
| `VERCEL_PUBLIC_DEPLOYMENT.md` | Deployment guide |
| `VERCEL_QUICK_START.md` | Quick start guide |

## 🎯 Key Points

1. **Source of truth**: `src/api/vercel-mcp.ts`
2. **Entry point**: `api/vercel-mcp.js` (imports from dist/)
3. **Public URL**: `/api/mcp` (mapped via vercel.json)
4. **Build required**: Run `npm run build` before deploying
5. **No authentication**: Public access for everyone

## ✅ Verification

After deployment, verify:

```bash
# Check endpoint is accessible
curl https://your-project.vercel.app/api/mcp

# Test with MCP Inspector
npx @modelcontextprotocol/inspector@latest https://your-project.vercel.app

# Check CORS headers
curl -I https://your-project.vercel.app/api/mcp
```

Expected headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

**Clean • Simple • Organized** 🎉

