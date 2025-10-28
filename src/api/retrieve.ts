import { Request, Response } from 'express';
import { RAGPipeline } from '../rag/pipeline.js';
import { logger } from '../config/logger.js';

export function createRetrieveHandler(pipeline: RAGPipeline) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, limit } = req.body;

      // Validation
      if (!query || typeof query !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Query parameter is required and must be a string',
        });
        return;
      }

      if (!pipeline.isReady()) {
        const stats = await pipeline.getStats();
        res.status(503).json({
          error: 'Service Unavailable',
          message: stats.documentCount === 0 
            ? 'No documents have been indexed yet. Please ensure documents exist in the docs/ folder and restart the server.'
            : 'RAG Pipeline is not ready yet. Please try again later.',
          stats: {
            initialized: stats.isInitialized,
            documentCount: stats.documentCount,
          },
        });
        return;
      }

      // Retrieve documents
      const results = await pipeline.retrieve(query, limit);

      res.json({
        query,
        results: results.map(result => ({
          content: result.content,
          metadata: result.metadata,
          relevanceScore: result.relevanceScore,
        })),
        totalResults: results.length,
      });
    } catch (error) {
      logger.error('Error in retrieve endpoint', { error });
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve documents',
      });
    }
  };
}

