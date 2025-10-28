import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { logger } from '../config/logger.js';
import { config } from '../config/modelConfig.js';
import path from 'path';
import fs from 'fs/promises';

export interface LoadedDocument {
  content: string;
  metadata: {
    source: string;
    title?: string;
    section?: string;
    [key: string]: any;
  };
}

export class DocumentLoader {
  private docsPath: string;
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(docsPath: string = './docs', chunkSize?: number, chunkOverlap?: number) {
    this.docsPath = docsPath;
    this.chunkSize = chunkSize || config.chunkSize;
    this.chunkOverlap = chunkOverlap || config.chunkOverlap;
  }

  async loadDocuments(): Promise<LoadedDocument[]> {
    try {
      logger.info(`Loading documents from: ${this.docsPath}`);

      // Check if directory exists
      try {
        await fs.access(this.docsPath);
      } catch (error) {
        logger.warn(`Directory ${this.docsPath} does not exist. Creating it...`);
        await fs.mkdir(this.docsPath, { recursive: true });
        logger.warn(`Directory created. Please add markdown files to ${this.docsPath}`);
        return [];
      }

      // Load all markdown files from the docs directory
      const loader = new DirectoryLoader(
        this.docsPath,
        {
          '.md': (path) => new TextLoader(path),
          '.txt': (path) => new TextLoader(path),
        }
      );

      const docs = await loader.load();
      
      if (docs.length === 0) {
        logger.warn(`No documents found in ${this.docsPath}`);
        return [];
      }

      logger.info(`Loaded ${docs.length} documents`);

      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: this.chunkSize,
        chunkOverlap: this.chunkOverlap,
      });

      const splitDocs = await textSplitter.splitDocuments(docs);
      logger.info(`Split into ${splitDocs.length} chunks`);

      // Transform to our format with enhanced metadata
      const loadedDocs: LoadedDocument[] = splitDocs.map((doc, index) => {
        const filename = path.basename(doc.metadata.source);
        const title = this.extractTitle(doc.pageContent, filename);
        
        return {
          content: doc.pageContent,
          metadata: {
            source: filename,
            title,
            chunkIndex: index,
            ...doc.metadata,
          },
        };
      });

      logger.info(`Prepared ${loadedDocs.length} document chunks for indexing`);
      return loadedDocs;
    } catch (error) {
      logger.error('Failed to load documents', { error });
      throw new Error(`Failed to load documents: ${error}`);
    }
  }

  private extractTitle(content: string, fallback: string): string {
    // Try to extract title from markdown heading
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return trimmed.substring(2).trim();
      }
    }
    
    // Fallback to filename without extension
    return fallback.replace(/\.(md|txt)$/, '');
  }

  async getAvailableDocuments(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.docsPath);
      return files.filter(file => file.endsWith('.md') || file.endsWith('.txt'));
    } catch (error) {
      logger.error('Failed to get available documents', { error });
      return [];
    }
  }
}

export default DocumentLoader;

