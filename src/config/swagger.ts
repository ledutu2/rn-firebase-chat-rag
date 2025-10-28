import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RAG System API',
      version: '1.0.0',
      description: 'REST API for Retrieval-Augmented Generation system with LangChain, LanceDB, and Ollama',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'RAG',
        description: 'RAG operations (retrieve, generate)',
      },
      {
        name: 'System',
        description: 'System status and management',
      },
    ],
    components: {
      schemas: {
        RetrieveRequest: {
          type: 'object',
          required: ['query'],
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
              example: 'How to use Button component?',
            },
            limit: {
              type: 'integer',
              description: 'Maximum number of results',
              default: 5,
              example: 5,
            },
          },
        },
        RetrieveResponse: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
            },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  content: {
                    type: 'string',
                  },
                  metadata: {
                    type: 'object',
                  },
                  relevanceScore: {
                    type: 'number',
                  },
                },
              },
            },
            totalResults: {
              type: 'integer',
            },
          },
        },
        GenerateRequest: {
          type: 'object',
          required: ['query'],
          properties: {
            query: {
              type: 'string',
              description: 'Question to answer',
              example: 'What are the props of Button component?',
            },
            topK: {
              type: 'integer',
              description: 'Number of context documents to use',
              default: 5,
              example: 5,
            },
          },
        },
        GenerateResponse: {
          type: 'object',
          properties: {
            answer: {
              type: 'string',
            },
            contextUsed: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  content: {
                    type: 'string',
                  },
                  metadata: {
                    type: 'object',
                  },
                  score: {
                    type: 'number',
                  },
                },
              },
            },
            processingTimeMs: {
              type: 'integer',
            },
          },
        },
        StatusResponse: {
          type: 'object',
          properties: {
            documentCount: {
              type: 'integer',
            },
            isInitialized: {
              type: 'boolean',
            },
            availableComponents: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            configuration: {
              type: 'object',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./src/index.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);

