import { pipeline } from '@xenova/transformers';
import { logger } from '../config/logger.js';
import { config } from '../config/modelConfig.js';

export class Embedder {
  private model: any = null;
  private modelName: string;
  private initialized: boolean = false;

  constructor(modelName?: string) {
    this.modelName = modelName || config.embeddingModel;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      logger.info(`Initializing embedding model: ${this.modelName}`);
      
      // Load the feature extraction pipeline
      this.model = await pipeline('feature-extraction', this.modelName);
      
      this.initialized = true;
      logger.info('Embedding model initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize embedding model', { error });
      throw new Error(`Failed to initialize embedder: ${error}`);
    }
  }

  async embed(text: string): Promise<number[]> {
    if (!this.initialized || !this.model) {
      throw new Error('Embedder not initialized. Call initialize() first.');
    }

    try {
      const output = await this.model(text, {
        pooling: 'mean',
        normalize: true,
      });

      // Convert to regular array
      const embedding = Array.from(output.data) as number[];
      return embedding;
    } catch (error) {
      logger.error('Failed to generate embedding', { error });
      throw new Error(`Failed to embed text: ${error}`);
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.initialized || !this.model) {
      throw new Error('Embedder not initialized. Call initialize() first.');
    }

    try {
      logger.info(`Embedding batch of ${texts.length} texts`);
      
      const embeddings: number[][] = [];
      
      // Process in batches to avoid memory issues
      const batchSize = 10;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchPromises = batch.map(text => this.embed(text));
        const batchEmbeddings = await Promise.all(batchPromises);
        embeddings.push(...batchEmbeddings);
        
        logger.debug(`Processed ${Math.min(i + batchSize, texts.length)}/${texts.length} texts`);
      }

      logger.info(`Batch embedding completed: ${embeddings.length} embeddings generated`);
      return embeddings;
    } catch (error) {
      logger.error('Failed to generate batch embeddings', { error });
      throw new Error(`Failed to embed batch: ${error}`);
    }
  }

  isReady(): boolean {
    return this.initialized && this.model !== null;
  }

  getModelName(): string {
    return this.modelName;
  }
}

export default Embedder;

