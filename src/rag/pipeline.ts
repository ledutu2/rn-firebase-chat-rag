import { DocumentLoader } from './loader.js';
import { Embedder } from './embedder.js';
import { VectorStore, VectorDocument } from './vectorStore.js';
import { Retriever, RetrievalResult } from './retriever.js';
// COMMENTED OUT: Generation functionality disabled for VPS deployment
// import { Generator, GenerateResponse } from './generator.js';
import { logger } from '../config/logger.js';
import { config } from '../config/modelConfig.js';
import crypto from 'crypto';

export interface RAGPipelineConfig {
  docsPath?: string;
  embeddingModel?: string;
  lancedbPath?: string;
  llmModel?: string;
  ollamaBaseUrl?: string;
}

export class RAGPipeline {
  private loader: DocumentLoader;
  private embedder: Embedder;
  private vectorStore: VectorStore;
  private retriever: Retriever;
  // COMMENTED OUT: Generation functionality disabled for VPS deployment
  // private generator: Generator;
  private initialized: boolean = false;

  constructor(customConfig?: RAGPipelineConfig) {
    this.loader = new DocumentLoader(customConfig?.docsPath);
    this.embedder = new Embedder(customConfig?.embeddingModel);
    this.vectorStore = new VectorStore(customConfig?.lancedbPath);
    this.retriever = new Retriever(this.vectorStore, this.embedder);
    // COMMENTED OUT: Generation functionality disabled for VPS deployment
    // this.generator = new Generator(customConfig?.llmModel, customConfig?.ollamaBaseUrl);
  }

  async initialize(forceReindex: boolean = false): Promise<void> {
    if (this.initialized) {
      logger.info('RAG Pipeline already initialized');
      return;
    }

    try {
      logger.info('Initializing RAG Pipeline...');

      // Initialize components in order
      await this.embedder.initialize();
      await this.vectorStore.initialize();
      // COMMENTED OUT: Generation functionality disabled for VPS deployment
      // await this.generator.initialize();

      // Check if documents already exist
      const existingCount = await this.vectorStore.getDocumentCount();
      
      if (existingCount > 0 && !forceReindex) {
        logger.info(`Found ${existingCount} existing documents, skipping indexing`);
      } else {
        // Load and index documents
        await this.indexDocuments();
      }

      this.initialized = true;
      logger.info('RAG Pipeline initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize RAG Pipeline', { error });
      throw new Error(`Failed to initialize RAG Pipeline: ${error}`);
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

      logger.info(`Indexing ${documents.length} document chunks`);

      // Generate embeddings for all documents
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
      throw new Error(`Failed to index documents: ${error}`);
    }
  }

  async reindexDocuments(): Promise<number> {
    try {
      logger.info('Reindexing documents...');
      
      // Clear existing documents
      await this.vectorStore.deleteAll();
      
      // Reinitialize vector store
      await this.vectorStore.initialize();
      
      // Index documents again
      const count = await this.indexDocuments();
      
      logger.info('Reindexing completed');
      return count;
    } catch (error) {
      logger.error('Failed to reindex documents', { error });
      throw new Error(`Failed to reindex documents: ${error}`);
    }
  }

  async retrieve(query: string, limit?: number): Promise<RetrievalResult[]> {
    if (!this.isReady()) {
      throw new Error('RAG Pipeline not initialized. Call initialize() first.');
    }

    try {
      const results = await this.retriever.retrieve(query, { limit });
      return results;
    } catch (error) {
      logger.error('Failed to retrieve documents', { error });
      throw new Error(`Failed to retrieve documents: ${error}`);
    }
  }

  // COMMENTED OUT: Generation functionality disabled for VPS deployment
  // async generate(query: string, topK?: number): Promise<GenerateResponse> {
  //   if (!this.isReady()) {
  //     throw new Error('RAG Pipeline not initialized. Call initialize() first.');
  //   }

  //   try {
  //     const startTime = Date.now();
      
  //     // Retrieve relevant context
  //     const context = await this.retrieve(query, topK);
      
  //     // Generate answer
  //     const response = await this.generator.generate(query, context);
      
  //     const processingTime = Date.now() - startTime;
  //     logger.info(`Query processed in ${processingTime}ms`);
      
  //     return response;
  //   } catch (error) {
  //     logger.error('Failed to generate answer', { error });
  //     throw new Error(`Failed to generate answer: ${error}`);
  //   }
  // }

  // COMMENTED OUT: Generation functionality disabled for VPS deployment
  // async *generateStream(query: string, topK?: number): AsyncGenerator<string, void, unknown> {
  //   if (!this.isReady()) {
  //     throw new Error('RAG Pipeline not initialized. Call initialize() first.');
  //   }

  //   try {
  //     // Retrieve relevant context
  //     const context = await this.retrieve(query, topK);
      
  //     // Generate streaming answer
  //     yield* this.generator.generateStream(query, context);
  //   } catch (error) {
  //     logger.error('Failed to generate streaming answer', { error });
  //     throw new Error(`Failed to generate streaming answer: ${error}`);
  //   }
  // }

  async getStats(): Promise<{
    documentCount: number;
    isInitialized: boolean;
    configuration: Record<string, any>;
  }> {
    const documentCount = await this.vectorStore.getDocumentCount();
    
    return {
      documentCount,
      isInitialized: this.initialized,
      configuration: {
        embeddingModel: this.embedder.getModelName(),
        // COMMENTED OUT: Generation functionality disabled for VPS deployment
        // model: this.generator.getModelName(),
        topKResults: config.topKResults,
        chunkSize: config.chunkSize,
        chunkOverlap: config.chunkOverlap,
      },
    };
  }

  isReady(): boolean {
    return (
      this.initialized &&
      this.embedder.isReady() &&
      this.vectorStore.isReady() &&
      this.retriever.isReady()
      // COMMENTED OUT: Generation functionality disabled for VPS deployment
      // && this.generator.isReady()
    );
  }

  async close(): Promise<void> {
    logger.info('Closing RAG Pipeline...');
    await this.vectorStore.close();
    this.initialized = false;
    logger.info('RAG Pipeline closed');
  }

  private generateDocumentId(content: string, source: string): string {
    const hash = crypto.createHash('md5').update(content + source).digest('hex');
    return hash;
  }
}

export default RAGPipeline;

