#!/usr/bin/env node

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RAGPipeline } from '../rag/pipeline.js';
import { logger } from '../config/logger.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env') });

const PORT = parseInt(process.env.MCP_HTTP_PORT || '3001', 10);
const HOST = process.env.MCP_HTTP_HOST || '0.0.0.0';

/**
 * HTTP Server wrapper for MCP functionality
 * Exposes MCP tools as REST API endpoints
 */
class MCPHTTPServer {
  private app: express.Application;
  private ragPipeline: RAGPipeline;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.app = express();
    
    // Initialize RAGPipeline with absolute paths
    const docsPath = path.join(projectRoot, 'docs');
    const lancedbPath = path.join(projectRoot, 'data', 'lancedb');

    this.ragPipeline = new RAGPipeline({
      docsPath,
      lancedbPath,
    });

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security
    this.app.use(
      helmet({
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
        originAgentCluster: false,
        contentSecurityPolicy: false,
      })
    );

    // CORS
    this.app.use(
      cors({
        origin: '*', // Allow all origins for public MCP server
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      })
    );

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'ok',
        service: 'rn-firebase-chat-mcp',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    });

    // Root endpoint - MCP server info
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'rn-firebase-chat',
        version: '1.0.0',
        description: 'MCP Server for React Native Firebase Chat RAG System',
        endpoints: {
          health: '/health',
          tools: {
            retrieve_context: 'POST /tools/retrieve_context',
            search_by_metadata: 'POST /tools/search_by_metadata',
            get_stats: 'GET /tools/get_stats',
          },
          resources: {
            overview: 'GET /resources/overview',
            documents: 'GET /resources/documents',
          },
        },
      });
    });

    // MCP Tool: retrieve_context
    this.app.post('/tools/retrieve_context', async (req: Request, res: Response) => {
      try {
        const { question, limit = 5 } = req.body;

        if (!question) {
          return res.status(400).json({
            error: 'Question parameter is required',
          });
        }

        await this.ensureInitialized();

        if (!this.ragPipeline.isReady()) {
          const stats = await this.ragPipeline.getStats();
          return res.json({
            query: question,
            results: [],
            totalResults: 0,
            status: 'RAG pipeline is not ready. Please wait a moment and try again.',
            debug: {
              isInitialized: stats.isInitialized,
              documentCount: stats.documentCount,
            },
          });
        }

        const results = await this.ragPipeline.retrieve(question, limit);

        res.json({
          query: question,
          results: results.map((result) => ({
            content: result.content,
            metadata: result.metadata,
            relevanceScore: result.relevanceScore,
          })),
          totalResults: results.length,
        });
      } catch (error) {
        logger.error('Error in retrieve_context', { error });
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // MCP Tool: search_by_metadata
    this.app.post('/tools/search_by_metadata', async (req: Request, res: Response) => {
      try {
        const { filters, limit = 10 } = req.body;

        if (!filters || typeof filters !== 'object') {
          return res.status(400).json({
            error: 'Filters parameter is required and must be an object',
          });
        }

        await this.ensureInitialized();

        if (!this.ragPipeline.isReady()) {
          return res.json({
            filters,
            results: [],
            totalResults: 0,
            status: 'RAG pipeline is not ready.',
          });
        }

        // Get all results first (up to limit * 2 to have enough for filtering)
        const allResults = await this.ragPipeline.retrieve('', Math.min(limit * 2, 50));

        // Filter by metadata
        const filteredResults = allResults
          .filter((result) => {
            for (const [key, value] of Object.entries(filters)) {
              if (result.metadata[key] !== value) {
                return false;
              }
            }
            return true;
          })
          .slice(0, limit);

        res.json({
          filters,
          results: filteredResults.map((result) => ({
            content: result.content,
            metadata: result.metadata,
            relevanceScore: result.relevanceScore,
          })),
          totalResults: filteredResults.length,
        });
      } catch (error) {
        logger.error('Error in search_by_metadata', { error });
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // MCP Tool: get_stats
    this.app.get('/tools/get_stats', async (req: Request, res: Response) => {
      try {
        const stats = await this.ragPipeline.getStats();

        res.json({
          documentCount: stats.documentCount,
          isInitialized: stats.isInitialized,
          configuration: stats.configuration,
        });
      } catch (error) {
        logger.error('Error in get_stats', { error });
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // MCP Resource: overview
    this.app.get('/resources/overview', async (req: Request, res: Response) => {
      try {
        await this.ensureInitialized();
        const stats = await this.ragPipeline.getStats();

        const content = `# RAG System Overview

## System Information
- **Name**: React Native Firebase Chat RAG
- **Version**: 1.0.0
- **Status**: ${stats.isInitialized ? 'Ready' : 'Initializing'}

## Statistics
- **Total Documents**: ${stats.documentCount}
- **System Initialized**: ${stats.isInitialized}

## Configuration
- **Embedding Model**: ${stats.configuration.embeddingModel}
- **LLM Model**: ${stats.configuration.model}
- **Top-K Results**: ${stats.configuration.topKResults}
- **Chunk Size**: ${stats.configuration.chunkSize}
- **Chunk Overlap**: ${stats.configuration.chunkOverlap}

## Usage
Use the \`retrieve_context\` tool to search for specific information about React Native Firebase Chat implementation, including message handling, authentication, real-time updates, and Firebase integration patterns.

${
  !stats.isInitialized
    ? '\n**Note**: The RAG pipeline is still initializing. Some features may not be available until initialization is complete.'
    : ''
}
`;

        res.setHeader('Content-Type', 'text/markdown');
        res.send(content);
      } catch (error) {
        logger.error('Error in overview resource', { error });
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // MCP Resource: documents
    this.app.get('/resources/documents', async (req: Request, res: Response) => {
      try {
        await this.ensureInitialized();

        if (!this.ragPipeline.isReady()) {
          res.setHeader('Content-Type', 'text/markdown');
          return res.send('# Document Index\n\nRAG pipeline is still initializing. Please wait...');
        }

        const stats = await this.ragPipeline.getStats();
        const allResults = await this.ragPipeline.retrieve('', 100);

        // Helper function to create a clean preview
        const createPreview = (text: string, maxLength: number = 200): string => {
          if (text.length <= maxLength) return text;

          const truncated = text.substring(0, maxLength);
          const lastSpace = truncated.lastIndexOf(' ');

          return lastSpace > 0
            ? truncated.substring(0, lastSpace) + '...'
            : truncated + '...';
        };

        // Group chunks by source file
        const bySource = allResults.reduce((acc, result) => {
          const source = result.metadata.source || 'Unknown';
          if (!acc[source]) {
            acc[source] = [];
          }
          acc[source].push(result);
          return acc;
        }, {} as Record<string, typeof allResults>);

        const sourceFiles = Object.keys(bySource);

        const content = `# Document Index

## Summary
- **Total Chunks**: ${stats.documentCount}
- **Source Files**: ${sourceFiles.length}
- **Embedding Model**: ${stats.configuration.embeddingModel}

## Source Files

${sourceFiles
  .map((source) => {
    const fileName = source.split('/').pop() || source;
    const chunks = bySource[source];
    return `### 📄 ${fileName}
- **Chunks**: ${chunks.length}
- **Path**: \`${source}\``;
  })
  .join('\n\n')}

## Recent Chunks Preview (First 5)

${allResults
  .slice(0, 5)
  .map(
    (result, index) =>
      `### Chunk ${index + 1}
**From**: ${result.metadata.source?.split('/').pop() || 'Unknown'}  
**Content**: ${createPreview(result.content, 250)}
`
  )
  .join('\n')}

---

💡 **Tip**: Use the \`retrieve_context\` tool to search for specific content across all ${
          stats.documentCount
        } chunks.
`;

        res.setHeader('Content-Type', 'text/markdown');
        res.send(content);
      } catch (error) {
        logger.error('Error in documents resource', { error });
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
      });
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (this.ragPipeline.isReady()) {
      return;
    }

    if (this.initializationPromise) {
      try {
        await this.initializationPromise;
      } catch (error) {
        logger.error('RAG pipeline not ready', { error });
      }
    }
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting MCP HTTP Server...');
      logger.info(`Project root: ${projectRoot}`);

      // Initialize RAG pipeline asynchronously
      this.initializationPromise = this.ragPipeline.initialize();
      
      // Start server immediately (non-blocking)
      this.app.listen(PORT, HOST, () => {
        logger.info(`🚀 MCP HTTP Server running on http://${HOST}:${PORT}`);
        logger.info(`📚 MCP Server Info: http://${HOST}:${PORT}/`);
        logger.info(`💚 Health Check: http://${HOST}:${PORT}/health`);
      });

      // Wait for initialization in background
      try {
        await this.initializationPromise;
        logger.info('RAG pipeline initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize RAG pipeline', { error });
      }
    } catch (error) {
      logger.error('Failed to start MCP HTTP server', { error });
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      await this.ragPipeline.close();
      logger.info('MCP HTTP Server stopped');
    } catch (error) {
      logger.error('Error stopping MCP HTTP server', { error });
    }
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string, server: MCPHTTPServer) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  try {
    await server.stop();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
};

// Start the server
const server = new MCPHTTPServer();
server.start().catch((error) => {
  logger.error('Fatal error', { error });
  process.exit(1);
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
process.on('SIGINT', () => gracefulShutdown('SIGINT', server));

