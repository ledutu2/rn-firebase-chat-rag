import { Request, Response } from 'express';
import { RAGPipeline } from '../rag/pipeline.js';
import { logger } from '../config/logger.js';

export function createStatusHandler(pipeline: RAGPipeline) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await pipeline.getStats();

      res.json({
        documentCount: stats.documentCount,
        isInitialized: stats.isInitialized,
        availableComponents: [], // Can be enhanced to list components
        configuration: stats.configuration,
      });
    } catch (error) {
      logger.error('Error in status endpoint', { error });
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get status',
      });
    }
  };
}

export function createReindexHandler(pipeline: RAGPipeline) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      if (!pipeline.isReady()) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'RAG Pipeline is not ready yet. Please try again later.',
        });
        return;
      }

      logger.info('Reindexing documents requested');
      const documentCount = await pipeline.reindexDocuments();

      res.json({
        message: 'Documents reindexed successfully',
        documentCount,
      });
    } catch (error) {
      logger.error('Error in reindex endpoint', { error });
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to reindex documents',
      });
    }
  };
}

