import { z } from 'zod';
import { createMcpHandler } from 'mcp-handler';
import { RAGPipeline } from '../rag/pipeline.js';
import path from 'path';

/**
 * Vercel MCP Server for React Native Firebase Chat RAG System
 * 
 * This server exposes the RAG functionality as MCP tools via HTTP,
 * allowing AI assistants to interact with React Native Firebase Chat documentation
 * through Vercel's serverless infrastructure.
 * 
 * 🌐 PUBLIC ACCESS: This server is open to everyone without authentication.
 * Anyone can use the MCP tools to query the React Native Firebase Chat documentation.
 */

// Initialize RAG pipeline (will be cached across invocations)
let ragPipeline: RAGPipeline | null = null;
let initializationPromise: Promise<void> | null = null;

const getRAGPipeline = async (): Promise<RAGPipeline> => {
  if (ragPipeline && ragPipeline.isReady()) {
    return ragPipeline;
  }

  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        // For Vercel deployment, use environment variables or default paths
        const projectRoot = process.cwd();
        const docsPath = process.env.DOCS_PATH || path.join(projectRoot, 'docs');
        const lancedbPath = process.env.LANCEDB_PATH || path.join(projectRoot, 'data', 'lancedb');

        ragPipeline = new RAGPipeline({
          docsPath,
          lancedbPath,
        });

        await ragPipeline.initialize();
        console.log('[MCP Vercel] RAG pipeline initialized successfully');
      } catch (error) {
        console.error('[MCP Vercel] Failed to initialize RAG pipeline:', error);
        throw error;
      }
    })();
  }

  await initializationPromise;
  return ragPipeline!;
};

// Create the MCP handler with all tools
const handler = createMcpHandler((server) => {
    // Tool 1: Retrieve Context
    server.tool(
      'retrieve_context',
      'Retrieve relevant React Native Firebase Chat documentation context based on a query. Returns document chunks about chat implementation, message handling, authentication, real-time updates, and Firebase integration with relevance scores.',
      {
        question: z.string().describe('The question or query about React Native Firebase Chat to find relevant context for (e.g., "How to implement firebase chat?", "Firebase authentication setup", "Real-time message synchronization")'),
        limit: z.number().int().min(1).max(20).default(5).optional().describe('Maximum number of chunks to retrieve (1-20)'),
      },
      async ({ question, limit = 5 }) => {
        try {
          const pipeline = await getRAGPipeline();
          
          if (!pipeline.isReady()) {
            const stats = await pipeline.getStats();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    query: question,
                    results: [],
                    totalResults: 0,
                    status: 'RAG pipeline is not ready. Please wait a moment and try again.',
                    debug: {
                      isInitialized: stats.isInitialized,
                      documentCount: stats.documentCount,
                    },
                  }, null, 2),
                },
              ],
            };
          }

          const results = await pipeline.retrieve(question, limit);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  query: question,
                  results: results.map((result) => ({
                    content: result.content,
                    metadata: result.metadata,
                    relevanceScore: result.relevanceScore,
                  })),
                  totalResults: results.length,
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: error instanceof Error ? error.message : 'Unknown error',
                  query: question,
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Tool 2: Search by Metadata
    server.tool(
      'search_by_metadata',
      'Search React Native Firebase Chat documentation by metadata filters (filename, section, subsection). Useful for finding specific documentation sections about chat features, Firebase setup, or implementation patterns.',
      {
        filters: z.record(z.any()).describe('Metadata filters as key-value pairs (e.g., {"section": "Authentication"}, {"filename": "rn-firebase-chat-doc.md"})'),
        limit: z.number().int().min(1).max(100).default(10).optional().describe('Maximum number of results'),
      },
      async ({ filters, limit = 10 }) => {
        try {
          const pipeline = await getRAGPipeline();
          
          if (!pipeline.isReady()) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    filters,
                    results: [],
                    totalResults: 0,
                    status: 'RAG pipeline is not ready.',
                  }, null, 2),
                },
              ],
            };
          }

          // Get all results first (up to limit * 2 to have enough for filtering)
          const allResults = await pipeline.retrieve('', Math.min(limit * 2, 50));

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
                text: JSON.stringify({
                  filters,
                  results: filteredResults.map((result) => ({
                    content: result.content,
                    metadata: result.metadata,
                    relevanceScore: result.relevanceScore,
                  })),
                  totalResults: filteredResults.length,
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: error instanceof Error ? error.message : 'Unknown error',
                  filters,
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Tool 3: Get Stats
    server.tool(
      'get_stats',
      'Get React Native Firebase Chat RAG system statistics including indexed document count, embedding model configuration, and system status. Useful for verifying the system is ready and understanding available documentation coverage.',
      {},
      async () => {
        try {
          const pipeline = await getRAGPipeline();
          const stats = await pipeline.getStats();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  documentCount: stats.documentCount,
                  isInitialized: stats.isInitialized,
                  configuration: stats.configuration,
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: error instanceof Error ? error.message : 'Unknown error',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }
    );
});

// Export handlers for Vercel
export { handler as GET, handler as POST, handler as DELETE };

