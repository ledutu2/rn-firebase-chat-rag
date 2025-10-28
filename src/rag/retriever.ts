import { VectorStore, SearchResult } from './vectorStore.js';
import { Embedder } from './embedder.js';
import { logger } from '../config/logger.js';
import { config } from '../config/modelConfig.js';

export interface RetrievalResult {
  content: string;
  metadata: Record<string, any>;
  relevanceScore: number;
}

export interface RetrievalOptions {
  limit?: number;
  metadataFilter?: Record<string, any>;
}

export class Retriever {
  private vectorStore: VectorStore;
  private embedder: Embedder;

  constructor(vectorStore: VectorStore, embedder: Embedder) {
    this.vectorStore = vectorStore;
    this.embedder = embedder;
  }

  async retrieve(query: string, options?: RetrievalOptions): Promise<RetrievalResult[]> {
    try {
      const limit = options?.limit || config.topKResults;
      logger.info(`Retrieving documents for query: "${query}" (limit: ${limit})`);

      // Generate embedding for the query
      const queryEmbedding = await this.embedder.embed(query);

      // Perform similarity search
      const results = await this.vectorStore.similaritySearch(queryEmbedding, limit);

      // Apply metadata filtering if specified
      let filteredResults = results;
      if (options?.metadataFilter) {
        filteredResults = this.applyMetadataFilter(results, options.metadataFilter);
      }

      // Transform to retrieval results
      const retrievalResults: RetrievalResult[] = filteredResults.map(result => ({
        content: result.content,
        metadata: result.metadata,
        relevanceScore: this.convertDistanceToScore(result.score),
      }));

      logger.info(`Retrieved ${retrievalResults.length} relevant documents`);
      return retrievalResults;
    } catch (error) {
      logger.error('Failed to retrieve documents', { error });
      throw new Error(`Failed to retrieve documents: ${error}`);
    }
  }

  private applyMetadataFilter(
    results: SearchResult[],
    filter: Record<string, any>
  ): SearchResult[] {
    return results.filter(result => {
      for (const [key, value] of Object.entries(filter)) {
        if (result.metadata[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  private convertDistanceToScore(distance: number): number {
    // Convert distance to similarity score (0-1 range)
    // Lower distance = higher similarity
    // This is a simple conversion; adjust based on your embedding model
    return Math.max(0, 1 - distance);
  }

  async getAvailableComponents(): Promise<string[]> {
    try {
      // This would require scanning the vector store
      // For now, return empty array - can be enhanced
      logger.debug('Getting available components');
      return [];
    } catch (error) {
      logger.error('Failed to get available components', { error });
      return [];
    }
  }

  isReady(): boolean {
    return this.vectorStore.isReady() && this.embedder.isReady();
  }
}

export default Retriever;

