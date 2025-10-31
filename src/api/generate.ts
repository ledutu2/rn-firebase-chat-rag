// COMMENTED OUT: Generation functionality disabled for VPS deployment
// import { Request, Response } from 'express';
// import { RAGPipeline } from '../rag/pipeline.js';
// import { logger } from '../config/logger.js';

// export function createGenerateHandler(pipeline: RAGPipeline) {
//   return async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { query, topK } = req.body;

//       // Validation
//       if (!query || typeof query !== 'string') {
//         res.status(400).json({
//           error: 'Bad Request',
//           message: 'Query parameter is required and must be a string',
//         });
//         return;
//       }

//       if (!pipeline.isReady()) {
//         res.status(503).json({
//           error: 'Service Unavailable',
//           message: 'RAG Pipeline is not ready yet. Please try again later.',
//         });
//         return;
//       }

//       const startTime = Date.now();

//       // Generate answer with context
//       const response = await pipeline.generate(query, topK);

//       const processingTimeMs = Date.now() - startTime;

//       res.json({
//         answer: response.answer,
//         contextUsed: response.contextUsed.map(context => ({
//           content: context.content,
//           metadata: context.metadata,
//           score: context.relevanceScore,
//         })),
//         processingTimeMs,
//       });
//     } catch (error) {
//       logger.error('Error in generate endpoint', { error });
//       res.status(500).json({
//         error: 'Internal Server Error',
//         message: 'Failed to generate answer',
//       });
//     }
//   };
// }

