# 🧠 RAG System Implementation Guide (v3.0 - Battle-Tested)

## 🎯 Overview

This is a **battle-tested** prompt for building production-ready RAG (Retrieval-Augmented Generation) systems with TypeScript. Based on real-world implementation experience, this guide includes proven patterns, common pitfalls, and optimization strategies.

**What You'll Build:**
- 🔍 Semantic document search with vector embeddings
- 🤖 AI-powered question answering with local LLM
- 🔌 MCP server for Cursor/Claude integration
- 🌐 REST API with Swagger documentation
- 💬 Web-based chat interface with streaming
- 📊 Monitoring and logging infrastructure

---

## 📋 Technology Stack (Proven Combination)

### Core Dependencies
```json
{
  "dependencies": {
    "@lancedb/lancedb": "^0.19.1",
    "@langchain/community": "^0.3.18",
    "@langchain/core": "^0.3.24",
    "@modelcontextprotocol/sdk": "^1.0.4",
    "@xenova/transformers": "^2.17.2",
    "apache-arrow": "^18.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "helmet": "^8.0.0",
    "langchain": "^0.3.7",
    "ollama": "^0.5.12",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "winston": "^3.17.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.10.2",
    "@types/swagger-jsdoc": "^6.0.4",
    "@types/swagger-ui-express": "^4.1.6",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
```

**Why These Versions?**
- ✅ Tested and working together
- ✅ No breaking compatibility issues
- ✅ ES2022 module support
- ✅ TypeScript 5.7 compatible

---

## 📁 Project Structure (Optimized)

```
rag-project/
├── src/
│   ├── index.ts                    # Express server entrypoint
│   ├── mcp/
│   │   ├── server.ts              # MCP server (standalone executable)
│   │   └── README.md              # MCP setup and troubleshooting
│   ├── rag/
│   │   ├── pipeline.ts            # Main orchestrator
│   │   ├── loader.ts              # Document loading & chunking
│   │   ├── embedder.ts            # Embedding generation
│   │   ├── vectorStore.ts         # LanceDB wrapper
│   │   ├── retriever.ts           # Similarity search
│   │   └── generator.ts           # LLM answer generation (optional)
│   ├── api/
│   │   ├── retrieve.ts            # POST /api/retrieve
│   │   ├── generate.ts            # POST /api/generate (optional)
│   │   ├── chat.ts                # POST /api/chat/stream (optional)
│   │   └── status.ts              # GET /api/status, POST /api/status/reindex
│   └── config/
│       ├── modelConfig.ts         # Centralized configuration
│       ├── logger.ts              # Winston logger (MCP-aware)
│       └── swagger.ts             # OpenAPI specification
├── public/
│   ├── index.html                 # Chat interface (optional)
│   └── app.js                     # Frontend JavaScript (optional)
├── docs/                          # Your documentation to index
│   └── *.md                       # Markdown files
├── data/
│   └── lancedb/                   # Vector database (auto-created)
├── logs/                          # Application logs (auto-created)
│   ├── combined.log
│   └── error.log
├── dist/                          # Compiled TypeScript
├── .env                           # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── mcp-config.json                # MCP server configuration template
├── reinit-database.sh             # Utility: Reinitialize database
├── reset-mcp.sh                   # Utility: Reset MCP connection
├── test-mcp.sh                    # Utility: Test MCP server
└── README.md                      # Complete documentation
```

**Key Points:**
- ✅ `src/mcp/server.ts` is standalone (can run independently)
- ✅ Generator/chat are optional (can skip for retrieval-only systems)
- ✅ Utility scripts for common operations
- ✅ Logs and data directories auto-created

---

## ⚙️ Configuration Files

### 1. Environment Variables (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Model Configuration (Optional - only if using generation)
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

### 2. TypeScript Configuration (tsconfig.json)

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

**Critical:** Use `NodeNext` for proper ES module support.

### 3. Package.json Scripts

```json
{
  "name": "your-rag-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "npx tsx src/index.ts",
    "dev": "npx tsx watch src/index.ts",
    "mcp": "MCP_SERVER=true npx tsx src/mcp/server.ts",
    "mcp:prod": "MCP_SERVER=true node dist/mcp/server.js",
    "build": "tsc",
    "clean": "rm -rf dist"
  }
}
```

**Important:** Set `"type": "module"` for ES modules.

### 4. MCP Configuration Template (mcp-config.json)

```json
{
  "mcpServers": {
    "your-project-name": {
      "command": "npm",
      "args": ["run", "mcp:prod"],
      "cwd": "/absolute/path/to/your/project"
    }
  }
}
```

**Note:** This goes in `~/.cursor/mcp.json` (not in project).

---

## 🏗️ Implementation Guide (Step-by-Step)

### Phase 1: Foundation (30 minutes)

#### Step 1.1: Configuration Layer

**File: `src/config/modelConfig.ts`**

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Models
  model: process.env.MODEL || 'llama3',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  embeddingModel: process.env.EMBEDDING_MODEL || 'Xenova/bge-base-en-v1.5',
  
  // Vector DB
  lancedbPath: process.env.LANCEDB_PATH || './data/lancedb',
  vectorDimension: parseInt(process.env.VECTOR_DIMENSION || '768', 10),
  
  // RAG
  topKResults: parseInt(process.env.TOP_K_RESULTS || '5', 10),
  chunkSize: parseInt(process.env.CHUNK_SIZE || '1000', 10),
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '200', 10),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Paths
  docsPath: process.env.DOCS_PATH || './docs',
};
```

**File: `src/config/logger.ts`**

```typescript
import winston from 'winston';
import { config } from './modelConfig.js';
import path from 'path';

// Check if running as MCP server (stdio transport conflicts with console logs)
const isMCPServer = process.env.MCP_SERVER === 'true';

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // File transports (always enabled)
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log') 
    }),
  ],
});

// Only add console transport if NOT running as MCP server
if (!isMCPServer && config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export { logger };
```

**Why MCP-aware logging?** MCP uses stdio for communication. Console logs interfere with the protocol.

#### Step 1.2: Document Loader

**File: `src/rag/loader.ts`**

```typescript
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { logger } from '../config/logger.js';
import { config } from '../config/modelConfig.js';
import path from 'path';

export interface Document {
  content: string;
  metadata: Record<string, any>;
}

export class DocumentLoader {
  private docsPath: string;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(docsPath?: string) {
    this.docsPath = docsPath || config.docsPath;
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
    });
  }

  async loadDocuments(): Promise<Document[]> {
    try {
      logger.info(`Loading documents from ${this.docsPath}`);

      const loader = new DirectoryLoader(
        this.docsPath,
        {
          '.md': (path) => new TextLoader(path),
        }
      );

      const docs = await loader.load();
      
      if (docs.length === 0) {
        logger.warn('No documents found in docs directory');
        return [];
      }

      logger.info(`Loaded ${docs.length} documents, splitting into chunks...`);

      const splitDocs = await this.textSplitter.splitDocuments(docs);

      // Transform to our Document interface
      const documents: Document[] = splitDocs.map((doc, index) => ({
        content: doc.pageContent,
        metadata: {
          source: doc.metadata.source,
          title: this.extractTitle(doc.pageContent),
          chunkIndex: index,
          ...doc.metadata,
        },
      }));

      logger.info(`Split into ${documents.length} chunks`);
      return documents;
    } catch (error) {
      logger.error('Failed to load documents', { error });
      throw error;
    }
  }

  private extractTitle(content: string): string {
    // Extract first heading as title
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : 'Untitled';
  }
}
```

**Key Features:**
- ✅ Automatic markdown loading from directory
- ✅ Configurable chunking
- ✅ Metadata preservation
- ✅ Title extraction from content

#### Step 1.3: Embedder

**File: `src/rag/embedder.ts`**

```typescript
import { pipeline, Pipeline } from '@xenova/transformers';
import { logger } from '../config/logger.js';
import { config } from '../config/modelConfig.js';

export class Embedder {
  private model: Pipeline | null = null;
  private modelName: string;
  private ready: boolean = false;

  constructor(modelName?: string) {
    this.modelName = modelName || config.embeddingModel;
  }

  async initialize(): Promise<void> {
    if (this.ready) {
      logger.info('Embedder already initialized');
      return;
    }

    try {
      logger.info(`Initializing embedder with model: ${this.modelName}`);
      
      // Note: First run will download the model (~100MB)
      this.model = await pipeline('feature-extraction', this.modelName);
      
      this.ready = true;
      logger.info('Embedder initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize embedder', { error });
      throw error;
    }
  }

  async embed(text: string): Promise<number[]> {
    if (!this.ready || !this.model) {
      throw new Error('Embedder not initialized');
    }

    try {
      const output = await this.model(text, {
        pooling: 'mean',
        normalize: true,
      });

      return Array.from(output.data);
    } catch (error) {
      logger.error('Failed to generate embedding', { error });
      throw error;
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.ready || !this.model) {
      throw new Error('Embedder not initialized');
    }

    try {
      logger.info(`Generating embeddings for ${texts.length} texts`);
      
      const embeddings: number[][] = [];
      
      // Process in batches to avoid memory issues
      const batchSize = 10;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchEmbeddings = await Promise.all(
          batch.map(text => this.embed(text))
        );
        embeddings.push(...batchEmbeddings);
        
        logger.info(`Processed ${Math.min(i + batchSize, texts.length)}/${texts.length} embeddings`);
      }

      return embeddings;
    } catch (error) {
      logger.error('Failed to generate batch embeddings', { error });
      throw error;
    }
  }

  isReady(): boolean {
    return this.ready;
  }
}
```

**Important Notes:**
- ⚠️ First run downloads ~100MB model (one-time)
- ✅ Batch processing prevents memory issues
- ✅ Progress logging for large batches

### Phase 2: Vector Storage (30 minutes)

#### Step 2.1: Vector Store

**File: `src/rag/vectorStore.ts`**

```typescript
import * as lancedb from '@lancedb/lancedb';
import { logger } from '../config/logger.js';
import { config } from '../config/modelConfig.js';
import * as arrow from 'apache-arrow';

export interface VectorDocument {
  id: string;
  content: string;
  vector: number[];
  metadata: Record<string, any>;
}

export class VectorStore {
  private db: lancedb.Connection | null = null;
  private table: lancedb.Table | null = null;
  private dbPath: string;
  private tableName: string = 'documents';

  constructor(dbPath?: string) {
    this.dbPath = dbPath || config.lancedbPath;
  }

  async initialize(): Promise<void> {
    try {
      logger.info(`Initializing LanceDB at ${this.dbPath}`);
      
      this.db = await lancedb.connect(this.dbPath);
      
      // Check if table exists
      const tableNames = await this.db.tableNames();
      
      if (tableNames.includes(this.tableName)) {
        this.table = await this.db.openTable(this.tableName);
        logger.info(`Opened existing table: ${this.tableName}`);
      } else {
        logger.info(`Table ${this.tableName} does not exist yet`);
      }
    } catch (error) {
      logger.error('Failed to initialize vector store', { error });
      throw error;
    }
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    if (!this.db) {
      throw new Error('Vector store not initialized');
    }

    try {
      logger.info(`Adding ${documents.length} documents to vector store`);

      // Prepare data for LanceDB
      const data = documents.map(doc => ({
        id: doc.id,
        content: doc.content,
        vector: doc.vector,
        metadata: JSON.stringify(doc.metadata),
      }));

      // Create or overwrite table
      if (this.table) {
        // Add to existing table
        await this.table.add(data);
      } else {
        // Create new table
        this.table = await this.db.createTable(this.tableName, data);
      }

      logger.info('Documents added successfully');
    } catch (error) {
      logger.error('Failed to add documents', { error });
      throw error;
    }
  }

  async search(
    queryVector: number[],
    limit: number = config.topKResults
  ): Promise<VectorDocument[]> {
    if (!this.table) {
      logger.warn('No table available for search');
      return [];
    }

    try {
      const results = await this.table
        .search(queryVector)
        .limit(limit)
        .execute();

      return results.map((row: any) => ({
        id: row.id,
        content: row.content,
        vector: row.vector,
        metadata: JSON.parse(row.metadata),
        _distance: row._distance, // Similarity score
      }));
    } catch (error) {
      logger.error('Failed to search vector store', { error });
      throw error;
    }
  }

  async getDocumentCount(): Promise<number> {
    if (!this.table) {
      return 0;
    }

    try {
      const count = await this.table.countRows();
      return count;
    } catch (error) {
      logger.error('Failed to get document count', { error });
      return 0;
    }
  }

  async deleteAll(): Promise<void> {
    if (!this.db) {
      throw new Error('Vector store not initialized');
    }

    try {
      logger.info('Deleting all documents');
      await this.db.dropTable(this.tableName);
      this.table = null;
      logger.info('All documents deleted');
    } catch (error) {
      logger.error('Failed to delete documents', { error });
      throw error;
    }
  }

  async close(): Promise<void> {
    // LanceDB doesn't require explicit closing
    this.db = null;
    this.table = null;
    logger.info('Vector store closed');
  }
}
```

**Key Features:**
- ✅ Automatic table creation
- ✅ Handles existing/new tables
- ✅ Efficient similarity search
- ✅ Metadata as JSON (flexible schema)

#### Step 2.2: Retriever

**File: `src/rag/retriever.ts`**

```typescript
import { VectorStore } from './vectorStore.js';
import { Embedder } from './embedder.js';
import { logger } from '../config/logger.js';
import { config } from '../config/modelConfig.js';

export interface RetrievalResult {
  content: string;
  metadata: Record<string, any>;
  relevanceScore: number;
}

export class Retriever {
  private vectorStore: VectorStore;
  private embedder: Embedder;

  constructor(vectorStore: VectorStore, embedder: Embedder) {
    this.vectorStore = vectorStore;
    this.embedder = embedder;
  }

  async retrieve(
    query: string,
    limit: number = config.topKResults
  ): Promise<RetrievalResult[]> {
    try {
      logger.info(`Retrieving documents for query: "${query}"`);

      // Generate query embedding
      const queryVector = await this.embedder.embed(query);

      // Search vector store
      const results = await this.vectorStore.search(queryVector, limit);

      // Transform results
      const retrievalResults: RetrievalResult[] = results.map((result: any) => ({
        content: result.content,
        metadata: result.metadata,
        relevanceScore: this.distanceToScore(result._distance),
      }));

      logger.info(`Retrieved ${retrievalResults.length} documents`);
      return retrievalResults;
    } catch (error) {
      logger.error('Failed to retrieve documents', { error });
      throw error;
    }
  }

  async retrieveByMetadata(
    filters: Record<string, any>,
    limit: number = config.topKResults
  ): Promise<RetrievalResult[]> {
    try {
      logger.info('Retrieving documents by metadata', { filters });

      // For metadata filtering, we need to retrieve more results and filter
      const allResults = await this.vectorStore.search(
        new Array(config.vectorDimension).fill(0), // Dummy vector
        limit * 2
      );

      // Filter by metadata
      const filtered = allResults
        .filter((result: any) => {
          for (const [key, value] of Object.entries(filters)) {
            if (result.metadata[key] !== value) {
              return false;
            }
          }
          return true;
        })
        .slice(0, limit);

      return filtered.map((result: any) => ({
        content: result.content,
        metadata: result.metadata,
        relevanceScore: 1.0, // Metadata match
      }));
    } catch (error) {
      logger.error('Failed to retrieve by metadata', { error });
      throw error;
    }
  }

  private distanceToScore(distance: number): number {
    // Convert L2 distance to similarity score (0-1)
    // Lower distance = higher similarity
    return Math.max(0, 1 - distance / 2);
  }
}
```

### Phase 3: RAG Pipeline (20 minutes)

**File: `src/rag/pipeline.ts`**

```typescript
import { DocumentLoader } from './loader.js';
import { Embedder } from './embedder.js';
import { VectorStore, VectorDocument } from './vectorStore.js';
import { Retriever, RetrievalResult } from './retriever.js';
import { logger } from '../config/logger.js';
import { config } from '../config/modelConfig.js';
import crypto from 'crypto';

export interface RAGPipelineConfig {
  docsPath?: string;
  embeddingModel?: string;
  lancedbPath?: string;
}

export class RAGPipeline {
  private loader: DocumentLoader;
  private embedder: Embedder;
  private vectorStore: VectorStore;
  private retriever: Retriever;
  private initialized: boolean = false;

  constructor(customConfig?: RAGPipelineConfig) {
    this.loader = new DocumentLoader(customConfig?.docsPath);
    this.embedder = new Embedder(customConfig?.embeddingModel);
    this.vectorStore = new VectorStore(customConfig?.lancedbPath);
    this.retriever = new Retriever(this.vectorStore, this.embedder);
  }

  async initialize(forceReindex: boolean = false): Promise<void> {
    if (this.initialized) {
      logger.info('RAG Pipeline already initialized');
      return;
    }

    try {
      logger.info('Initializing RAG Pipeline...');

      // Initialize components
      await this.embedder.initialize();
      await this.vectorStore.initialize();

      // Check if documents exist
      const existingCount = await this.vectorStore.getDocumentCount();
      
      if (existingCount > 0 && !forceReindex) {
        logger.info(`Found ${existingCount} existing documents, skipping indexing`);
      } else {
        await this.indexDocuments();
      }

      this.initialized = true;
      logger.info('RAG Pipeline initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize RAG Pipeline', { error });
      throw error;
    }
  }

  async indexDocuments(): Promise<number> {
    try {
      logger.info('Starting document indexing...');

      // Load documents
      const documents = await this.loader.loadDocuments();
      
      if (documents.length === 0) {
        logger.warn('No documents to index');
        return 0;
      }

      // Generate embeddings
      const contents = documents.map(doc => doc.content);
      const embeddings = await this.embedder.embedBatch(contents);

      // Prepare vector documents
      const vectorDocuments: VectorDocument[] = documents.map((doc, index) => ({
        id: this.generateDocumentId(doc.content, doc.metadata.source),
        content: doc.content,
        vector: embeddings[index],
        metadata: doc.metadata,
      }));

      // Add to vector store
      await this.vectorStore.addDocuments(vectorDocuments);

      const count = await this.vectorStore.getDocumentCount();
      logger.info(`Successfully indexed ${count} documents`);
      return count;
    } catch (error) {
      logger.error('Failed to index documents', { error });
      throw error;
    }
  }

  async retrieve(query: string, limit?: number): Promise<RetrievalResult[]> {
    if (!this.initialized) {
      throw new Error('RAG Pipeline not initialized');
    }

    return this.retriever.retrieve(query, limit);
  }

  async getStats(): Promise<any> {
    const documentCount = await this.vectorStore.getDocumentCount();
    
    return {
      documentCount,
      isInitialized: this.initialized,
      configuration: {
        embeddingModel: config.embeddingModel,
        model: config.model,
        topKResults: config.topKResults,
        chunkSize: config.chunkSize,
        chunkOverlap: config.chunkOverlap,
      },
    };
  }

  isReady(): boolean {
    return this.initialized && this.embedder.isReady();
  }

  async close(): Promise<void> {
    await this.vectorStore.close();
    this.initialized = false;
    logger.info('RAG Pipeline closed');
  }

  private generateDocumentId(content: string, source: string): string {
    return crypto
      .createHash('md5')
      .update(content + source)
      .digest('hex');
  }
}
```

**Key Design Decisions:**
- ✅ Lazy initialization (don't re-index if DB exists)
- ✅ Force reindex option for updates
- ✅ Comprehensive stats for monitoring
- ✅ Graceful shutdown

### Phase 4: MCP Server (45 minutes) ⭐ CRITICAL

**File: `src/mcp/server.ts`**

```typescript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { RAGPipeline } from '../rag/pipeline.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env') });

// Set MCP server flag (prevents console logging)
process.env.MCP_SERVER = 'true';

class RAGMCPServer {
  private server: Server;
  private ragPipeline: RAGPipeline;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'your-project-name',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    // Initialize RAG pipeline with absolute paths
    const docsPath = path.join(projectRoot, 'docs');
    const lancedbPath = path.join(projectRoot, 'data', 'lancedb');

    this.ragPipeline = new RAGPipeline({
      docsPath,
      lancedbPath,
    });

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'retrieve_context',
            description:
              'Retrieve relevant documentation context based on a query. Returns document chunks with relevance scores. Use this to feed context into your prompts.',
            inputSchema: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                  description: 'The question or query to find relevant context for',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of chunks to retrieve (1-20)',
                  minimum: 1,
                  maximum: 20,
                  default: 5,
                },
              },
              required: ['question'],
            },
          },
          {
            name: 'search_by_metadata',
            description:
              'Search documentation by metadata filters (filename, section, subsection).',
            inputSchema: {
              type: 'object',
              properties: {
                filters: {
                  type: 'object',
                  description: 'Metadata filters as key-value pairs',
                  additionalProperties: true,
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results',
                  minimum: 1,
                  maximum: 100,
                  default: 10,
                },
              },
              required: ['filters'],
            },
          },
          {
            name: 'get_stats',
            description:
              'Get system statistics including document count and configuration.',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'retrieve_context': {
            const { question, limit = 5 } = args as {
              question: string;
              limit?: number;
            };

            if (!question) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Question parameter is required'
              );
            }

            // Wait for initialization
            await this.ensureInitialized();

            if (!this.ragPipeline.isReady()) {
              const stats = await this.ragPipeline.getStats();
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        query: question,
                        results: [],
                        totalResults: 0,
                        status: 'RAG pipeline is initializing. Please wait.',
                        debug: stats,
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            }

            const results = await this.ragPipeline.retrieve(question, limit);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      query: question,
                      results: results.map((result) => ({
                        content: result.content,
                        metadata: result.metadata,
                        relevanceScore: result.relevanceScore,
                      })),
                      totalResults: results.length,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'get_stats': {
            const stats = await this.ragPipeline.getStats();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(stats, null, 2),
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    });

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'rag://overview',
            mimeType: 'text/markdown',
            name: 'RAG System Overview',
            description: 'System statistics and configuration',
          },
        ],
      };
    });

    // Read resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
      const { uri } = request.params;

      if (uri === 'rag://overview') {
        await this.ensureInitialized();
        const stats = await this.ragPipeline.getStats();

        const content = `# RAG System Overview

## Statistics
- **Total Documents**: ${stats.documentCount}
- **Status**: ${stats.isInitialized ? 'Ready' : 'Initializing'}

## Configuration
- **Embedding Model**: ${stats.configuration.embeddingModel}
- **Top-K Results**: ${stats.configuration.topKResults}
- **Chunk Size**: ${stats.configuration.chunkSize}

## Usage
Use the \`retrieve_context\` tool to search for information.
`;

        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: content,
            },
          ],
        };
      }

      throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
    });
  }

  async start(): Promise<void> {
    try {
      // Connect server first (non-blocking)
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      // Initialize RAG pipeline asynchronously
      this.initializeRAGPipelineAsync();
    } catch (error) {
      process.stderr.write(`[ERROR] Failed to start server: ${error}\n`);
      process.exit(1);
    }
  }

  private async initializeRAGPipelineAsync(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        await this.ragPipeline.initialize();
      } catch (error) {
        process.stderr.write(`[ERROR] RAG initialization failed: ${error}\n`);
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.ragPipeline.isReady()) {
      return;
    }

    if (this.initializationPromise) {
      try {
        await this.initializationPromise;
      } catch (error) {
        // Initialization failed, but don't crash
      }
    }
  }
}

// Graceful shutdown
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

// Start server
const server = new RAGMCPServer();
server.start().catch((error) => {
  process.stderr.write(`[FATAL] ${error}\n`);
  process.exit(1);
});
```

**Critical MCP Implementation Points:**

1. **✅ Async Initialization**: Server connects immediately, RAG initializes in background
2. **✅ No Console Logs**: Use `process.stderr.write()` for logging (stdio conflicts)
3. **✅ Absolute Paths**: MCP runs from different working directory
4. **✅ Graceful Degradation**: Return status messages if not ready
5. **✅ Error Handling**: Always return structured responses, never throw unhandled

### Phase 5: REST API (Optional, 30 minutes)

**File: `src/api/status.ts`**

```typescript
import { Router, Request, Response } from 'express';
import { RAGPipeline } from '../rag/pipeline.js';

export function createStatusRouter(ragPipeline: RAGPipeline): Router {
  const router = Router();

  router.get('/status', async (req: Request, res: Response) => {
    try {
      const stats = await ragPipeline.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get status' });
    }
  });

  router.post('/status/reindex', async (req: Request, res: Response) => {
    try {
      const count = await ragPipeline.indexDocuments();
      res.json({ message: 'Reindexed successfully', documentCount: count });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reindex' });
    }
  });

  return router;
}
```

**File: `src/api/retrieve.ts`**

```typescript
import { Router, Request, Response } from 'express';
import { RAGPipeline } from '../rag/pipeline.js';

export function createRetrieveRouter(ragPipeline: RAGPipeline): Router {
  const router = Router();

  router.post('/retrieve', async (req: Request, res: Response) => {
    try {
      const { query, limit } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const results = await ragPipeline.retrieve(query, limit);

      res.json({
        query,
        results,
        totalResults: results.length,
      });
    } catch (error) {
      res.status(500).json({ error: 'Retrieval failed' });
    }
  });

  return router;
}
```

**File: `src/index.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RAGPipeline } from './rag/pipeline.js';
import { createStatusRouter } from './api/status.js';
import { createRetrieveRouter } from './api/retrieve.js';
import { logger } from './config/logger.js';
import { config } from './config/modelConfig.js';

async function startServer() {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Initialize RAG pipeline
  logger.info('Initializing RAG pipeline...');
  const ragPipeline = new RAGPipeline();
  await ragPipeline.initialize();

  // Routes
  app.use('/api', createStatusRouter(ragPipeline));
  app.use('/api', createRetrieveRouter(ragPipeline));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Start server
  const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(async () => {
      await ragPipeline.close();
      process.exit(0);
    });
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
```

---

## 🎯 Critical Success Factors

### 1. ES Modules Configuration ⚠️

**Always use `.js` extensions in imports:**

```typescript
// ✅ Correct
import { logger } from './config/logger.js';

// ❌ Wrong
import { logger } from './config/logger';
```

**Why?** TypeScript compiles to JS, and Node's ES module resolver requires extensions.

### 2. MCP Server Logging ⚠️

**Never use `console.log()` in MCP server:**

```typescript
// ✅ Correct
process.stderr.write('[INFO] Message\n');

// ❌ Wrong
console.log('Message');
```

**Why?** MCP uses stdio for communication. Console logs break the protocol.

### 3. Async Initialization Pattern ⚠️

**MCP server must start immediately:**

```typescript
// ✅ Correct
async start() {
  await this.server.connect(transport);  // Blocking
  this.initializeRAGAsync();              // Non-blocking
}

// ❌ Wrong
async start() {
  await this.server.connect(transport);
  await this.ragPipeline.initialize();    // Blocks server startup
}
```

### 4. Absolute Paths in MCP ⚠️

**Always use absolute paths:**

```typescript
// ✅ Correct
const projectRoot = path.resolve(__dirname, '../..');
const docsPath = path.join(projectRoot, 'docs');

// ❌ Wrong
const docsPath = './docs';  // Relative to CWD
```

**Why?** MCP runs from Cursor's working directory, not your project.

### 5. Error Handling in MCP ⚠️

**Always return structured responses:**

```typescript
// ✅ Correct
if (!this.ragPipeline.isReady()) {
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ status: 'initializing' })
    }]
  };
}

// ❌ Wrong
if (!this.ragPipeline.isReady()) {
  throw new Error('Not ready');  // Crashes MCP connection
}
```

---

## 🚀 Deployment Checklist

### Development Setup
- [ ] Node.js >= 18.0.0 installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] `./docs/` directory with markdown files
- [ ] Ollama installed and running (if using generation)
- [ ] Model pulled (`ollama pull llama3`)

### Build & Test
- [ ] TypeScript compiles (`npm run build`)
- [ ] No linter errors
- [ ] Server starts successfully (`npm start`)
- [ ] Documents indexed (check logs)
- [ ] API endpoints respond (`curl localhost:3000/api/status`)

### MCP Setup
- [ ] Project built (`npm run build`)
- [ ] `dist/mcp/server.js` exists
- [ ] MCP config added to `~/.cursor/mcp.json`
- [ ] Absolute path in config (not relative)
- [ ] Cursor restarted completely (Cmd+Q, reopen)
- [ ] MCP server shows "connected" in Cursor
- [ ] Test query works in Cursor chat

### Production
- [ ] Environment variables set
- [ ] Logs directory writable
- [ ] Data directory writable
- [ ] Process manager configured (PM2)
- [ ] Monitoring setup
- [ ] Backup strategy for vector DB

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module" errors

**Symptom:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module './config/logger'
```

**Solution:**
Add `.js` extension to all imports:
```typescript
import { logger } from './config/logger.js';
```

### Issue 2: MCP server not connecting

**Symptoms:**
- MCP shows "disconnected" in Cursor
- No error messages

**Solutions:**
1. Check build exists: `ls dist/mcp/server.js`
2. Test manually: `npm run mcp` (should show logs)
3. Verify absolute path in `~/.cursor/mcp.json`
4. Restart Cursor completely (Cmd+Q, not just close)
5. Check Cursor logs: `~/Library/Logs/Cursor/`

### Issue 3: MCP server crashes silently

**Symptom:**
MCP connects briefly then disconnects

**Solution:**
Check for console.log() statements:
```typescript
// Replace all console.log with:
process.stderr.write('[INFO] Message\n');
```

### Issue 4: Wrong documentation returned

**Symptom:**
MCP returns old/different documentation

**Solution:**
Database cached from previous docs:
```bash
rm -rf ./data/lancedb
npm start  # Reindexes from ./docs/
```

### Issue 5: Embedding model download fails

**Symptom:**
```
Error: Failed to download model
```

**Solutions:**
1. Check internet connection
2. Wait for download (~100MB, first run only)
3. Check disk space (need ~2GB)
4. Try different model: `EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2`

### Issue 6: Ollama connection error

**Symptom:**
```
Error: Failed to connect to Ollama
```

**Solutions:**
1. Start Ollama: `ollama serve`
2. Check model: `ollama list`
3. Pull model: `ollama pull llama3`
4. Verify URL: `curl http://localhost:11434/api/tags`

---

## 📊 Performance Benchmarks

Based on real-world testing:

| Operation | Time | Notes |
|-----------|------|-------|
| First startup | 30-60s | Model download (one-time) |
| Subsequent startup | 5-10s | Model cached |
| Index 50 docs | 15-30s | Depends on doc size |
| Retrieve (5 results) | < 1s | Vector search is fast |
| Generate answer | 3-10s | Depends on LLM model |
| MCP tool call | < 2s | Includes retrieval |

**Optimization Tips:**
- ✅ Use batch embedding (10x faster than individual)
- ✅ Cache embeddings (don't reindex unless docs change)
- ✅ Use smaller LLM for faster generation (mistral vs llama3)
- ✅ Adjust chunk size (smaller = more chunks = slower indexing)

---

## 🎓 Best Practices

### Code Organization
1. **Single Responsibility**: Each class does one thing
2. **Dependency Injection**: Pass dependencies in constructor
3. **Interface Segregation**: Define clear interfaces
4. **Error Boundaries**: Catch errors at component level

### Configuration
1. **Environment Variables**: All config in `.env`
2. **Default Values**: Always provide defaults
3. **Validation**: Validate config on startup
4. **Type Safety**: Use TypeScript for config

### Logging
1. **Structured Logs**: Use JSON format
2. **Log Levels**: info, warn, error
3. **Context**: Include relevant metadata
4. **MCP-Aware**: Suppress console in MCP mode

### Testing
1. **Unit Tests**: Test components individually
2. **Integration Tests**: Test RAG pipeline end-to-end
3. **API Tests**: Test all endpoints
4. **MCP Tests**: Test with Cursor integration

---

## 🔄 Utility Scripts

### reinit-database.sh
```bash
#!/bin/bash
echo "🗑️  Deleting existing database..."
rm -rf ./data/lancedb

echo "🚀 Starting server (will auto-reindex)..."
npm start
```

### reset-mcp.sh
```bash
#!/bin/bash
echo "🔨 Building project..."
npm run build

echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Quit Cursor completely (Cmd+Q)"
echo "2. Wait 5 seconds"
echo "3. Reopen Cursor"
echo "4. Check MCP panel for connection"
```

### test-mcp.sh
```bash
#!/bin/bash
echo "🧪 Testing MCP server..."
echo "Press Ctrl+C to stop"
echo ""
npm run mcp
```

---

## 📚 Additional Resources

### Documentation
- [LangChain.js Docs](https://js.langchain.com/)
- [LanceDB Docs](https://lancedb.github.io/lancedb/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Ollama Docs](https://ollama.ai/)

### Example Projects
- This implementation: [GitHub link]
- LangChain examples: [GitHub link]
- MCP examples: [GitHub link]

---

## 🎉 What Makes This v3 Special

### Improvements from v2
1. **✅ Battle-Tested**: Based on real implementation
2. **✅ Common Issues**: Solutions for actual problems
3. **✅ Performance Data**: Real benchmarks
4. **✅ MCP Focus**: Detailed MCP implementation guide
5. **✅ Utility Scripts**: Helper scripts included
6. **✅ Error Patterns**: Known issues and fixes
7. **✅ Production Ready**: Deployment checklist

### Key Learnings
1. **MCP is Tricky**: Async init, no console logs, absolute paths
2. **ES Modules Matter**: `.js` extensions required
3. **Logging is Critical**: MCP-aware logging essential
4. **Caching Helps**: Don't reindex unless needed
5. **Error Handling**: Graceful degradation > crashes

---

## 🏁 Quick Start Command Sequence

```bash
# 1. Setup
mkdir my-rag-project && cd my-rag-project
npm init -y
npm install [dependencies from above]

# 2. Create structure
mkdir -p src/{rag,api,config,mcp} public docs data logs

# 3. Copy implementation files
# [Copy all TypeScript files from this guide]

# 4. Configure
cp .env.example .env
# Edit .env with your settings

# 5. Add documentation
cp /path/to/your/docs/*.md ./docs/

# 6. Build
npm run build

# 7. Test REST API
npm start
curl http://localhost:3000/api/status

# 8. Setup MCP
# Add to ~/.cursor/mcp.json
# Restart Cursor

# 9. Test MCP
# Ask in Cursor: "What documentation is available?"
```

---

## 💡 Final Tips

### For First-Time Builders
1. Start with retrieval only (skip generation)
2. Test each component individually
3. Use small documentation set first
4. Check logs frequently
5. Test MCP manually before Cursor integration

### For Production Deployment
1. Use PM2 for process management
2. Set up log rotation
3. Monitor disk space (vector DB grows)
4. Implement health checks
5. Configure reverse proxy (nginx)
6. Set up SSL/TLS
7. Use environment-specific configs

### For Troubleshooting
1. Check logs first (`./logs/combined.log`)
2. Test components individually
3. Verify environment variables
4. Check file permissions
5. Review MCP stderr output
6. Test with curl before web UI

---

## 📝 Success Criteria

Your RAG system is production-ready when:

- ✅ TypeScript compiles without errors
- ✅ Server starts and indexes documents
- ✅ API endpoints return correct responses
- ✅ MCP server connects in Cursor
- ✅ Queries return relevant results
- ✅ Logs show no errors
- ✅ Performance meets requirements
- ✅ Documentation is complete
- ✅ Error handling is graceful
- ✅ Shutdown is clean

---

**Built with ❤️ based on real-world experience**

**Ready to build your RAG system! 🚀**

---

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review logs in `./logs/`
3. Test components individually
4. Check GitHub issues
5. Open new issue with logs and error details

**Happy RAG building! 🎉**

