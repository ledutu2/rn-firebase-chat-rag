import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { logger } from './config/logger.js';
import { config } from './config/modelConfig.js';
import { swaggerSpec } from './config/swagger.js';
import { RAGPipeline } from './rag/pipeline.js';
import { createRetrieveHandler } from './api/retrieve.js';
// COMMENTED OUT: Generation functionality disabled for VPS deployment
// import { createGenerateHandler } from './api/generate.js';
// import { createChatStreamHandler } from './api/chat.js';
import { createStatusHandler, createReindexHandler } from './api/status.js';

// Initialize Express app
const app = express();

// Middleware
app.use(
  helmet({
    // Disable problematic security headers for HTTP deployment
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    originAgentCluster: false,
    contentSecurityPolicy: false, // Disable CSP to avoid mixed content issues
  })
);

// Configure CORS for specific host
app.use(
  cors({
    origin: [
      'http://10.30.10.35:4000',
      'http://10.30.10.35',
      'http://localhost:4000',
      'http://localhost',
      `${config.protocol}://${config.host}:${config.port}`,
      `${config.protocol}://${config.host}`,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware to handle HTTP deployment issues
app.use((req: Request, res: Response, next: NextFunction) => {
  // Remove problematic headers that cause issues with HTTP
  res.removeHeader('Cross-Origin-Opener-Policy');
  res.removeHeader('Cross-Origin-Embedder-Policy');
  res.removeHeader('Origin-Agent-Cluster');

  // Set proper CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept'
  );

  next();
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Static files
app.use(express.static('public'));

// API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      // Ensure Swagger UI works with HTTP
      url: `${config.protocol}://${config.host}:${config.port}/api-docs/swagger.json`,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete'],
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'RAG System API - Retrieval Only',
  })
);

// Serve the swagger spec as JSON
app.get('/api-docs/swagger.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Handle preflight requests
app.options('*', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Initialize RAG Pipeline
const pipeline = new RAGPipeline();

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'RAG System API - Retrieval Only (VPS Mode)',
    version: '1.0.0',
    endpoints: {
      documentation: '/api-docs',
      status: '/api/status',
      retrieve: 'POST /api/retrieve',
      // COMMENTED OUT: Generation functionality disabled for VPS deployment
      // generate: 'POST /api/generate',
      // chat: 'POST /api/chat/stream',
      reindex: 'POST /api/status/reindex',
    },
  });
});

/**
 * @openapi
 * /api/status:
 *   get:
 *     summary: Get system status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatusResponse'
 */
app.get('/api/status', createStatusHandler(pipeline));

/**
 * @openapi
 * /api/status/reindex:
 *   post:
 *     summary: Reindex all documents
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Reindex successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 documentCount:
 *                   type: integer
 */
app.post('/api/status/reindex', createReindexHandler(pipeline));

/**
 * @openapi
 * /api/retrieve:
 *   post:
 *     summary: Retrieve relevant documents
 *     tags: [RAG]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RetrieveRequest'
 *     responses:
 *       200:
 *         description: Retrieved documents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RetrieveResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/api/retrieve', createRetrieveHandler(pipeline));

// COMMENTED OUT: Generation functionality disabled for VPS deployment
// /**
//  * @openapi
//  * /api/generate:
//  *   post:
//  *     summary: Generate answer with context
//  *     tags: [RAG]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/GenerateRequest'
//  *     responses:
//  *       200:
//  *         description: Generated answer
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/GenerateResponse'
//  *       400:
//  *         description: Bad request
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// app.post('/api/generate', createGenerateHandler(pipeline));

// COMMENTED OUT: Generation functionality disabled for VPS deployment
// /**
//  * @openapi
//  * /api/chat/stream:
//  *   post:
//  *     summary: Stream chat response
//  *     tags: [RAG]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/GenerateRequest'
//  *     responses:
//  *       200:
//  *         description: Server-Sent Events stream
//  *         content:
//  *           text/event-stream:
//  *             schema:
//  *               type: string
//  */
// app.post('/api/chat/stream', createChatStreamHandler(pipeline));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { error: err });
  res.status(500).json({
    error: 'Internal Server Error',
    message:
      config.nodeEnv === 'development'
        ? err.message
        : 'An unexpected error occurred',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  try {
    await pipeline.close();
    logger.info('RAG Pipeline closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer() {
  try {
    logger.info('Starting RAG System...');

    // Initialize RAG Pipeline
    await pipeline.initialize();

    // Start Express server
    app.listen(config.port, () => {
      logger.info(
        `🚀 Server running on ${config.protocol}://${config.host}:${config.port}`
      );
      logger.info(
        `📚 API Documentation: ${config.protocol}://${config.host}:${config.port}/api-docs`
      );
      logger.info(
        `💬 Chat Interface: ${config.protocol}://${config.host}:${config.port}`
      );
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();
