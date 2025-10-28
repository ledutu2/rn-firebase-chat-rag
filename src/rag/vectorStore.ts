import * as lancedb from '@lancedb/lancedb';
import { logger } from '../config/logger.js';
import { config } from '../config/modelConfig.js';

export interface DocumentMetadata {
  source: string;
  title?: string;
  section?: string;
  [key: string]: any;
}

export interface VectorDocument {
  id: string;
  content: string;
  vector: number[];
  metadata: DocumentMetadata;
}

export interface SearchResult {
  content: string;
  metadata: DocumentMetadata;
  score: number;
}

export class VectorStore {
  private db: lancedb.Connection | null = null;
  private table: lancedb.Table | null = null;
  private tableName: string = 'documents';
  private dbPath: string;
  private initialized: boolean = false;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || config.lancedbPath;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      logger.info(`Initializing LanceDB at: ${this.dbPath}`);

      // Connect to LanceDB
      this.db = await lancedb.connect(this.dbPath);

      // Check if table exists
      const tableNames = await this.db.tableNames();

      if (tableNames.includes(this.tableName)) {
        logger.info(`Opening existing table: ${this.tableName}`);
        this.table = await this.db.openTable(this.tableName);
      } else {
        logger.info(
          `Table ${this.tableName} does not exist yet. Will be created on first insert.`
        );
      }

      this.initialized = true;
      logger.info('VectorStore initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize VectorStore', { error });
      throw new Error(`Failed to initialize vector store: ${error}`);
    }
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    if (!this.initialized || !this.db) {
      throw new Error('VectorStore not initialized. Call initialize() first.');
    }

    try {
      logger.info(`Adding ${documents.length} documents to vector store`);

      // Prepare data for LanceDB
      const data = documents.map((doc) => ({
        id: doc.id,
        content: doc.content,
        vector: doc.vector,
        metadata: JSON.stringify(doc.metadata),
      }));

      if (!this.table) {
        // Create table if it doesn't exist
        logger.info(`Creating new table: ${this.tableName}`);
        this.table = await this.db.createTable(this.tableName, data);
      } else {
        // Add to existing table
        await this.table.add(data);
      }

      logger.info(`Successfully added ${documents.length} documents`);
    } catch (error) {
      logger.error('Failed to add documents to vector store', { error });
      throw new Error(`Failed to add documents: ${error}`);
    }
  }

  async similaritySearch(
    queryVector: number[],
    limit: number = config.topKResults
  ): Promise<SearchResult[]> {
    if (!this.initialized) {
      throw new Error('VectorStore not initialized. Call initialize() first.');
    }

    if (!this.table) {
      logger.warn('No table exists yet. No documents have been indexed.');
      return [];
    }

    try {
      logger.debug(`Performing similarity search with limit: ${limit}`);

      const results = await this.table
        .search(queryVector)
        .limit(limit)
        .toArray();

      const searchResults: SearchResult[] = results.map((result: any) => ({
        content: result.content,
        metadata: JSON.parse(result.metadata),
        score: result._distance || 0,
      }));

      logger.debug(`Found ${searchResults.length} results`);
      return searchResults;
    } catch (error) {
      logger.error('Failed to perform similarity search', { error });
      throw new Error(`Failed to search: ${error}`);
    }
  }

  async getDocumentCount(): Promise<number> {
    if (!this.table) {
      return 0;
    }

    try {
      const count = await this.table.countRows();
      return count;
    } catch (error) {
      logger.error('Failed to get document count', { error });
      return 0;
    }
  }

  async deleteAll(): Promise<void> {
    if (!this.initialized || !this.db) {
      throw new Error('VectorStore not initialized.');
    }

    try {
      if (this.table) {
        logger.info(`Dropping table: ${this.tableName}`);
        await this.db.dropTable(this.tableName);
        this.table = null;
        logger.info('Table dropped successfully');
      }
    } catch (error) {
      logger.error('Failed to delete all documents', { error });
      throw new Error(`Failed to delete all documents: ${error}`);
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      // LanceDB doesn't have an explicit close method
      this.db = null;
      this.table = null;
      this.initialized = false;
      logger.info('VectorStore connection closed');
    }
  }

  isReady(): boolean {
    return this.initialized && this.table !== null;
  }
}

export default VectorStore;
