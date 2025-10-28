# 🧠 RAG System Implementation Guide (Optimized v2.0)

## Role & Goal

You are a **senior AI engineer** with extensive experience building **Retrieval-Augmented Generation (RAG)** systems using TypeScript.

Your task is to **design and implement a complete, production-ready RAG system** with:
- **Modular architecture** for easy maintenance and extension
- **Dynamic model configuration** via environment variables
- **MCP (Model Context Protocol) server** for AI tool integration
- **REST API** for programmatic access
- **Web-based chat interface** for end-user interaction

---

## 📋 System Overview

The system will:
1. **Index** documentation from markdown files in `./docs/`
2. **Embed** documents using local transformer models
3. **Store** vectors in LanceDB for fast retrieval
4. **Retrieve** relevant context based on semantic similarity
5. **Generate** answers using a local LLM (Llama3 via Ollama)
6. **Expose** functionality via MCP server, REST API, and web UI

---

## 🔧 Technology Stack

### Core Technologies
- **Language:** TypeScript with ES2022 modules
- **Framework:** Express.js for REST API
- **RAG Framework:** LangChain.js (`@langchain/core`, `@langchain/community`)
- **Vector Database:** LanceDB (`@lancedb/lancedb`)
- **Embedding Model:** `@xenova/transformers` (e.g., `Xenova/bge-base-en-v1.5`)
- **LLM:** Llama3 via Ollama (local inference)

### Additional Requirements
- **MCP Server:** `@modelcontextprotocol/sdk` for Cursor/Claude integration
- **API Documentation:** Swagger UI (`swagger-ui-express`, `swagger-jsdoc`)
- **Logging:** Winston with file and console transports
- **Security:** Helmet for HTTP security headers
- **CORS:** Configured for development and production

---

## 📁 Project Structure

```
rag-project/
├── src/
│   ├── index.ts                    # Main Express server entrypoint
│   ├── mcp/
│   │   ├── server.ts              # MCP server implementation
│   │   └── README.md              # MCP setup guide
│   ├── rag/
│   │   ├── pipeline.ts            # Main RAG orchestrator
│   │   ├── loader.ts              # Document loading & chunking
│   │   ├── embedder.ts            # Embedding generation
│   │   ├── vectorStore.ts         # LanceDB wrapper
│   │   ├── retriever.ts           # Similarity search & retrieval
│   │   └── generator.ts           # LLM-based answer generation
│   ├── api/
│   │   ├── retrieve.ts            # POST /api/retrieve endpoint
│   │   ├── generate.ts            # POST /api/generate endpoint
│   │   ├── chat.ts                # POST /api/chat/stream endpoint
│   │   └── status.ts              # GET /api/status endpoint
│   └── config/
│       ├── modelConfig.ts         # Dynamic model configuration
│       ├── logger.ts              # Winston logger setup
│       └── swagger.ts             # OpenAPI specification
├── public/
│   ├── index.html                 # Chat interface UI
│   └── app.js                     # Frontend JavaScript
├── docs/                          # Documentation to be indexed
│   └── *.md                       # Markdown files
├── data/
│   └── lancedb/                   # Vector database storage (auto-created)
├── logs/                          # Application logs (auto-created)
│   ├── combined.log
│   └── error.log
├── dist/                          # Compiled TypeScript (build output)
├── .env                           # Environment variables
├── package.json
├── tsconfig.json
├── mcp-config.json                # MCP server configuration
└── README.md
```

---

## ⚙️ Configuration Requirements

### Environment Variables (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Model Configuration
MODEL=llama3
OLLAMA_BASE_URL=http://localhost:11434

# Embedding Model Configuration
EMBEDDING_MODEL=Xenova/bge-base-en-v1.5

# Vector Database Configuration
LANCEDB_PATH=./data/lancedb
VECTOR_DIMENSION=768

# RAG Configuration
TOP_K_RESULTS=5
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Logging
LOG_LEVEL=info
```

### TypeScript Configuration (tsconfig.json)

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
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### MCP Server Configuration (mcp-config.json)

```json
{
  "mcpServers": {
    "project-name": {
      "command": "npm",
      "args": ["run", "mcp:prod"],
      "cwd": "/absolute/path/to/project"
    }
  }
}
```

---

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "start": "npx tsx src/index.ts",
    "dev": "npx tsx watch src/index.ts",
    "mcp": "npx tsx src/mcp/server.ts",
    "mcp:prod": "node dist/mcp/server.js",
    "build": "tsc"
  }
}
```

---

## 🏗️ Implementation Guidelines

### 1. RAG Pipeline Architecture

#### Key Components

**RAGPipeline (Orchestrator)**
- Initializes all sub-components (loader, embedder, vector store, retriever, generator)
- Provides high-level methods: `retrieve()`, `generate()`, `generateStream()`
- Manages initialization state and graceful shutdown
- Implements `isReady()` check for all components

**DocumentLoader**
- Loads markdown files from `./docs/` directory
- Chunks documents using `RecursiveCharacterTextSplitter`
- Preserves metadata (filename, title, section)
- Default: 1000 chars with 200 char overlap

**Embedder**
- Uses `@xenova/transformers` for local embedding generation
- Batch processing for efficiency
- Implements `isReady()` to check initialization status
- Supports dynamic model switching via environment variable

**VectorStore**
- Wraps LanceDB for vector storage and retrieval
- Implements similarity search with configurable top-k
- Provides `getDocumentCount()`, `deleteAll()`, and `close()` methods
- Handles table creation and management

**Retriever**
- Performs semantic similarity search
- Supports metadata-based filtering (e.g., by component name)
- Returns results with relevance scores
- Provides `getAvailableComponents()` for listing indexed documents

**Generator**
- Uses Ollama for local LLM inference
- Supports both regular and streaming generation
- Constructs prompts with retrieved context
- Implements fallback responses when no context is found

### 2. API Endpoints

#### POST /api/retrieve
```typescript
Request: { query: string, limit?: number }
Response: {
  query: string,
  results: Array<{
    content: string,
    metadata: Record<string, any>,
    relevanceScore: number
  }>,
  totalResults: number
}
```

#### POST /api/generate
```typescript
Request: { query: string, topK?: number }
Response: {
  answer: string,
  contextUsed: Array<{
    content: string,
    metadata: Record<string, any>,
    score: number
  }>,
  processingTimeMs: number
}
```

#### POST /api/chat/stream
```typescript
Request: { query: string, topK?: number }
Response: Server-Sent Events (SSE) stream
Content-Type: text/event-stream
```

#### GET /api/status
```typescript
Response: {
  documentCount: number,
  isInitialized: boolean,
  availableComponents: string[],
  configuration: {
    embeddingModel: string,
    model: string,
    topKResults: number,
    chunkSize: number,
    chunkOverlap: number
  }
}
```

#### POST /api/status/reindex
```typescript
Response: { message: string, documentCount: number }
```

### 3. MCP Server Implementation

#### Required Tools

**retrieve_context**
- Description: Retrieve relevant documentation context based on a query
- Input: `{ question: string, limit?: number }`
- Output: JSON with query, results, and relevance scores

**search_by_metadata**
- Description: Search documentation by metadata filters
- Input: `{ filters: Record<string, any>, limit?: number }`
- Output: JSON with filtered results

**get_stats**
- Description: Get system statistics and configuration
- Input: `{}`
- Output: JSON with document count, components, and config

#### Required Resources

**Individual Documents**
- URI pattern: `project://{documentName}`
- Example: `project://Button`
- Returns: Full documentation for specific document/component

**Overview Resource**
- URI: `project://overview`
- Returns: List of all available documents and system stats

#### Critical Implementation Details

1. **Non-blocking initialization**: Start MCP server immediately, initialize RAG pipeline asynchronously
2. **Graceful degradation**: Provide fallback responses if RAG pipeline isn't ready
3. **stdio transport**: Use `StdioServerTransport` for MCP communication
4. **Suppress console logs**: Set `process.env.MCP_SERVER = 'true'` to prevent stdio interference
5. **Error handling**: Always return structured error responses, never throw unhandled exceptions

### 4. Logging Strategy

```typescript
// Use Winston with:
- Console transport (colorized, timestamp)
- File transports (combined.log, error.log)
- Configurable log level via environment variable
- Structured logging with metadata
- Suppression in MCP mode (stdio conflicts)
```

### 5. Security & Middleware

```typescript
// Express middleware chain:
1. Helmet (security headers)
2. CORS (configured for development/production)
3. Body parser (JSON, URL-encoded)
4. Request logging
5. Route handlers
6. Global error handler
```

---

## ✅ Expected Deliverables

### 1. Functional Requirements
- ✅ Complete TypeScript codebase with strict typing
- ✅ All API endpoints working with proper validation
- ✅ MCP server compatible with Cursor/Claude
- ✅ Web-based chat interface with streaming support
- ✅ Swagger documentation at `/api-docs`
- ✅ Graceful error handling and logging

### 2. Testing Commands

```bash
# Start REST API server
npm run start

# Start MCP server (for Cursor)
npm run mcp

# Build for production
npm run build

# Test API endpoints
curl http://localhost:3000/api/status
```

### 3. Sample Responses

**Retrieve Example:**
```json
{
  "query": "How to use Button component?",
  "results": [
    {
      "content": "Button component provides customizable...",
      "metadata": { "source": "Button.md", "title": "Button" },
      "relevanceScore": 0.89
    }
  ],
  "totalResults": 5
}
```

**Generate Example:**
```json
{
  "answer": "To use the Button component, import it and...",
  "contextUsed": [...],
  "processingTimeMs": 1234
}
```

---

## 🎯 Quality Checklist

### Code Quality
- [ ] TypeScript strict mode enabled, no `any` types
- [ ] Modular architecture with single responsibility principle
- [ ] Comprehensive error handling with typed errors
- [ ] Async/await for all asynchronous operations
- [ ] Proper resource cleanup (database connections, file handles)

### Configuration
- [ ] All sensitive values in `.env` file
- [ ] Default values for all configuration options
- [ ] Configuration validation on startup
- [ ] Clear error messages for missing/invalid config

### Performance
- [ ] Batch embedding generation for efficiency
- [ ] Lazy initialization of heavy resources
- [ ] Connection pooling where applicable
- [ ] Streaming responses for large outputs

### Documentation
- [ ] README with setup instructions
- [ ] API documentation via Swagger
- [ ] Inline JSDoc comments for complex functions
- [ ] Example requests and responses
- [ ] MCP setup guide

### Production Readiness
- [ ] Health check endpoint
- [ ] Graceful shutdown handling (SIGTERM, SIGINT)
- [ ] Structured logging with log levels
- [ ] Environment-specific configurations
- [ ] Build process for production deployment

---

## 🚀 Key Improvements from v1

### Architecture Enhancements
1. **Dual Interface**: Both MCP server and REST API for maximum flexibility
2. **Async Initialization**: MCP server starts immediately, RAG pipeline initializes in background
3. **Component Isolation**: Each RAG component is independently testable and replaceable
4. **Graceful Degradation**: System remains operational even if initialization fails

### Developer Experience
1. **Hot Reload**: Using `tsx watch` for development
2. **Type Safety**: Full TypeScript coverage with strict mode
3. **API Playground**: Swagger UI for testing endpoints
4. **Chat Interface**: Interactive web UI for immediate testing

### Production Features
1. **Streaming Support**: SSE for real-time chat responses
2. **Security Headers**: Helmet middleware for protection
3. **CORS Configuration**: Proper handling for cross-origin requests
4. **Structured Logging**: Winston with file rotation support
5. **Monitoring**: Status endpoints for health checks

### MCP-Specific Improvements
1. **Resource Support**: Expose individual documents as MCP resources
2. **Fallback Responses**: Always return useful information, even during initialization
3. **Clean stdio**: Proper log suppression to avoid transport conflicts
4. **Reinitialize Logic**: Automatic recovery from initialization failures

---

## 📝 Implementation Notes

### Critical Success Factors

1. **Use ES Modules**: Always use `.js` extensions in imports for compiled output compatibility
2. **Initialize Before Serving**: Ensure RAG pipeline is ready before accepting requests (REST API)
3. **Don't Block MCP Server**: Initialize asynchronously for MCP to respond immediately
4. **Test Ollama First**: Verify Ollama is running before starting the generator
5. **Handle Missing Docs**: Provide clear errors if `./docs/` directory is empty
6. **Preserve Metadata**: Keep document metadata throughout the pipeline for better context

### Common Pitfalls to Avoid

1. ❌ Don't use `console.log` in MCP server (interferes with stdio transport)
2. ❌ Don't block server startup with long initialization
3. ❌ Don't forget to close database connections on shutdown
4. ❌ Don't hardcode paths (use environment variables or config)
5. ❌ Don't expose errors directly in production (sanitize error messages)
6. ❌ Don't skip input validation (always validate user input)

### Testing Strategy

1. **Unit Tests**: Test individual components (embedder, retriever, etc.)
2. **Integration Tests**: Test RAG pipeline end-to-end
3. **API Tests**: Test all endpoints with various inputs
4. **MCP Tests**: Test MCP server with Cursor/Claude integration
5. **Load Tests**: Verify performance under concurrent requests

---

## 🔗 External Dependencies

### Required Services
- **Ollama**: Must be running locally (`ollama serve`)
- **Node.js**: Version 18.0.0 or higher
- **Disk Space**: ~2GB for models and vector database

### Optional Services
- **Redis**: For caching (not implemented in base version)
- **PostgreSQL**: For user management (not implemented in base version)

---

## 📚 Additional Resources

### LangChain.js Documentation
- [LangChain JS Docs](https://js.langchain.com/)
- [Document Loaders](https://js.langchain.com/docs/modules/data_connection/document_loaders/)
- [Text Splitters](https://js.langchain.com/docs/modules/data_connection/document_transformers/)

### LanceDB Documentation
- [LanceDB Docs](https://lancedb.github.io/lancedb/)
- [JavaScript API](https://lancedb.github.io/lancedb/javascript/)

### MCP SDK Documentation
- [Model Context Protocol](https://github.com/modelcontextprotocol/sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

### Xenova Transformers
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [Available Models](https://huggingface.co/models?library=transformers.js)

### Ollama Documentation
- [Ollama](https://ollama.ai/)
- [Model Library](https://ollama.ai/library)

---

## 🎬 Getting Started Workflow

### 1. Project Setup
```bash
mkdir rag-project && cd rag-project
npm init -y
npm install express cors helmet dotenv swagger-ui-express swagger-jsdoc winston
npm install langchain @langchain/core @langchain/community @lancedb/lancedb
npm install @xenova/transformers ollama @modelcontextprotocol/sdk
npm install -D typescript @types/node @types/express @types/cors tsx
```

### 2. Create Directory Structure
```bash
mkdir -p src/{rag,api,config,mcp} public docs data logs
touch .env tsconfig.json README.md
```

### 3. Setup Configuration Files
- Create `.env` with all required variables
- Create `tsconfig.json` with NodeNext modules
- Create `mcp-config.json` for Cursor integration

### 4. Implement Core Components (Recommended Order)
1. `src/config/logger.ts` - Logging infrastructure
2. `src/config/modelConfig.ts` - Configuration management
3. `src/rag/embedder.ts` - Embedding generation
4. `src/rag/vectorStore.ts` - Vector database wrapper
5. `src/rag/loader.ts` - Document loading
6. `src/rag/retriever.ts` - Similarity search
7. `src/rag/generator.ts` - LLM answer generation
8. `src/rag/pipeline.ts` - RAG orchestrator
9. `src/api/*.ts` - API endpoints
10. `src/index.ts` - Express server
11. `src/mcp/server.ts` - MCP server
12. `src/config/swagger.ts` - API documentation

### 5. Test Each Component
- Test embedder with sample text
- Test vector store CRUD operations
- Test loader with sample markdown files
- Test retriever with sample queries
- Test generator with sample prompts
- Test full RAG pipeline
- Test API endpoints
- Test MCP server with Cursor

### 6. Create Documentation
- Write README with setup instructions
- Document API endpoints in Swagger
- Create MCP integration guide
- Add example queries and responses

### 7. Production Deployment
```bash
npm run build
NODE_ENV=production node dist/index.js
```

---

## 🎯 Success Criteria

The RAG system is considered complete when:

1. ✅ All API endpoints return correct responses
2. ✅ Swagger documentation is accessible and accurate
3. ✅ MCP server connects successfully with Cursor/Claude
4. ✅ Chat interface works with streaming responses
5. ✅ System handles errors gracefully without crashes
6. ✅ Logs provide useful debugging information
7. ✅ Performance is acceptable (< 2s for retrieval, < 5s for generation)
8. ✅ Configuration is flexible via environment variables
9. ✅ Code follows TypeScript best practices
10. ✅ README provides clear setup instructions

---

## 💡 Extension Ideas (Post-MVP)

After the core system is working:

1. **Caching Layer**: Redis for frequently asked questions
2. **User Authentication**: JWT-based auth for API
3. **Rate Limiting**: Protect against abuse
4. **Multi-language Support**: i18n for chat interface
5. **Advanced Retrieval**: Hybrid search (semantic + keyword)
6. **Fine-tuning**: Custom embedding models for domain
7. **Feedback Loop**: Collect user feedback to improve responses
8. **Multi-document Support**: Support PDF, Word, etc.
9. **Collaborative Features**: Share conversations
10. **Analytics Dashboard**: Track usage and performance

---

## 🏁 Final Notes

This prompt incorporates lessons learned from real-world RAG implementation:

- **Modular design** makes debugging and testing easier
- **Async initialization** prevents blocking the MCP server
- **Graceful error handling** ensures system reliability
- **Comprehensive logging** simplifies troubleshooting
- **Dual interfaces** (MCP + REST) maximize usability
- **Production-ready code** from day one

Focus on **correctness first, optimization later**. Get the basic pipeline working, then improve performance and features iteratively.

Good luck building your RAG system! 🚀

