import { Request, Response } from 'express';
import { RAGPipeline } from '../rag/pipeline.js';
import { logger } from '../config/logger.js';

export function createChatStreamHandler(pipeline: RAGPipeline) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, topK } = req.body;

      // Validation
      if (!query || typeof query !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Query parameter is required and must be a string',
        });
        return;
      }

      if (!pipeline.isReady()) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'RAG Pipeline is not ready yet. Please try again later.',
        });
        return;
      }

      // Set headers for Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream the response
      try {
        for await (const chunk of pipeline.generateStream(query, topK)) {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
        
        // Send done event
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch (streamError) {
        logger.error('Error during streaming', { error: streamError });
        res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
        res.end();
      }
    } catch (error) {
      logger.error('Error in chat stream endpoint', { error });
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to start chat stream',
        });
      } else {
        res.end();
      }
    }
  };
}

