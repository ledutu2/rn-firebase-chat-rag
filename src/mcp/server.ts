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

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env') });

// Set MCP server flag to prevent console logging
process.env.MCP_SERVER = 'true';

/**
 * MCP Server for React Native Firebase Chat RAG System
 *
 * This server exposes the RAG functionality as MCP tools and resources,
 * allowing AI assistants like Claude or Cursor to directly interact with
 * the React Native Firebase Chat documentation, including chat implementation,
 * message handling, authentication, and real-time synchronization patterns.
 */
class RNFirebaseChatRAGServer {
  private server: Server;
  private ragPipeline: RAGPipeline;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'rn-firebase-chat',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    // Initialize RAGPipeline with absolute paths
    const docsPath = path.join(projectRoot, 'docs');
    const lancedbPath = path.join(projectRoot, 'data', 'lancedb');

    this.ragPipeline = new RAGPipeline({
      docsPath,
      lancedbPath,
    });
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'retrieve_context',
            description:
              'Retrieve relevant React Native Firebase Chat documentation context based on a query. Returns document chunks about chat implementation, message handling, authentication, real-time updates, and Firebase integration with relevance scores. Use this to feed context into your prompts.',
            inputSchema: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                  description:
                    'The question or query about React Native Firebase Chat to find relevant context for (e.g., "How to implement firebase chat?", "Firebase authentication setup", "Real-time message synchronization")',
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
              'Search React Native Firebase Chat documentation by metadata filters (filename, section, subsection). Useful for finding specific documentation sections about chat features, Firebase setup, or implementation patterns.',
            inputSchema: {
              type: 'object',
              properties: {
                filters: {
                  type: 'object',
                  description:
                    'Metadata filters as key-value pairs (e.g., {"section": "Authentication"}, {"filename": "rn-firebase-chat-doc.md"})',
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
              'Get React Native Firebase Chat RAG system statistics including indexed document count, embedding model configuration, and system status. Useful for verifying the system is ready and understanding available documentation coverage.',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: any) => {
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

              // Wait for initialization to complete if it's in progress
              await this.ensureInitialized();

              // Check if RAG pipeline is ready
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
                          status:
                            'RAG pipeline is not ready. Please wait a moment and try again.',
                          debug: {
                            isInitialized: stats.isInitialized,
                            documentCount: stats.documentCount,
                          },
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

            case 'search_by_metadata': {
              const { filters, limit = 10 } = args as {
                filters: Record<string, any>;
                limit?: number;
              };

              if (!filters || typeof filters !== 'object') {
                throw new McpError(
                  ErrorCode.InvalidParams,
                  'Filters parameter is required and must be an object'
                );
              }

              // Wait for initialization to complete if it's in progress
              await this.ensureInitialized();

              // Check if RAG pipeline is ready
              if (!this.ragPipeline.isReady()) {
                return {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify(
                        {
                          filters,
                          results: [],
                          totalResults: 0,
                          status: 'RAG pipeline is not ready.',
                        },
                        null,
                        2
                      ),
                    },
                  ],
                };
              }

              // Get all results first (up to limit * 2 to have enough for filtering)
              const allResults = await this.ragPipeline.retrieve(
                '',
                Math.min(limit * 2, 50)
              );

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

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        filters,
                        results: filteredResults.map((result) => ({
                          content: result.content,
                          metadata: result.metadata,
                          relevanceScore: result.relevanceScore,
                        })),
                        totalResults: filteredResults.length,
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
                    text: JSON.stringify(
                      {
                        documentCount: stats.documentCount,
                        isInitialized: stats.isInitialized,
                        configuration: stats.configuration,
                      },
                      null,
                      2
                    ),
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
      }
    );

    // List available resources
    this.server.setRequestHandler(
      ListResourcesRequestSchema,
      async (request: any) => {
        try {
          const resources = [];

          // Add general resources
          resources.push({
            uri: 'rag://overview',
            mimeType: 'text/markdown',
            name: 'RAG System Overview',
            description:
              'Overview of the RAG system including statistics and configuration',
          });

          resources.push({
            uri: 'rag://documents',
            mimeType: 'text/markdown',
            name: 'Document Index',
            description:
              'Overview of indexed documents with statistics and preview of recent chunks',
          });

          return { resources };
        } catch (error) {
          return { resources: [] };
        }
      }
    );

    // Read resource content
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request: any) => {
        const { uri } = request.params;

        try {
          // Wait for initialization to complete if it's in progress
          await this.ensureInitialized();

          if (uri === 'rag://overview') {
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

            return {
              contents: [
                {
                  uri,
                  mimeType: 'text/markdown',
                  text: content,
                },
              ],
            };
          } else if (uri === 'rag://documents') {
            if (!this.ragPipeline.isReady()) {
              return {
                contents: [
                  {
                    uri,
                    mimeType: 'text/markdown',
                    text: '# Document Index\n\nRAG pipeline is still initializing. Please wait...',
                  },
                ],
              };
            }

            const stats = await this.ragPipeline.getStats();
            const allResults = await this.ragPipeline.retrieve('', 100);

            // Helper function to create a clean preview
            const createPreview = (
              text: string,
              maxLength: number = 200
            ): string => {
              if (text.length <= maxLength) return text;

              // Find the last space before maxLength to avoid cutting words
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

          throw new McpError(
            ErrorCode.InvalidRequest,
            `Unknown resource URI: ${uri}`
          );
        } catch (error) {
          if (error instanceof McpError) {
            throw error;
          }

          throw new McpError(
            ErrorCode.InternalError,
            `Failed to read resource: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      }
    );
  }

  async start(): Promise<void> {
    try {
      // this.logInfo('[MCP] Starting MCP server...');
      // this.logInfo(`[MCP] Project root: ${projectRoot}`);

      // Create transport and connect first (non-blocking)
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      // this.logInfo('[MCP] Server connected via stdio');

      // Initialize RAG pipeline asynchronously (non-blocking)
      this.initializeRAGPipelineAsync();
    } catch (error) {
      this.logError(`[MCP] Failed to start server: ${error}`);
      process.exit(1);
    }
  }

  private async initializeRAGPipelineAsync(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        // this.logInfo('[MCP] Starting RAG pipeline initialization...');
        await this.ragPipeline.initialize();
        // this.logInfo('[MCP] RAG pipeline initialized successfully');
      } catch (error) {
        this.logError(`[MCP] Failed to initialize RAG pipeline: ${error}`);
        if (error instanceof Error) {
          this.logError(`[MCP] Stack trace: ${error.stack}`);
        }
        // Don't exit - let the server continue running
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
        // Initialization failed, but we'll still try to provide some response
        this.logError(`[MCP] RAG pipeline not ready: ${error}`);
      }
    }
  }

  async stop(): Promise<void> {
    try {
      await this.ragPipeline.close();
    } catch (error) {
      this.logError(`[MCP] Error stopping server: ${error}`);
    }
  }

  // Logging helpers to distinguish between info and error messages
  private logInfo(message: string): void {
    // Write to stderr with INFO prefix (MCP servers typically use stderr for logging)
    // But we add a clear prefix to distinguish from errors
    process.stderr.write(`[INFO] ${message}\n`);
  }

  private logError(message: string): void {
    // Write actual errors to stderr with ERROR prefix
    process.stderr.write(`[ERROR] ${message}\n`);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  process.exit(0);
});

process.on('SIGTERM', async () => {
  process.exit(0);
});

// Start the MCP server
const mcpServer = new RNFirebaseChatRAGServer();
mcpServer.start().catch((error) => {
  process.stderr.write(`[MCP] Fatal error: ${error}\n`);
  process.exit(1);
});
