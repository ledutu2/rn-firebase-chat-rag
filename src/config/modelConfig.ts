import dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

export interface ModelConfig {
  // Server Configuration
  port: number;
  nodeEnv: string;

  // Model Configuration
  model: string;
  ollamaBaseUrl: string;

  // Embedding Model Configuration
  embeddingModel: string;

  // Vector Database Configuration
  lancedbPath: string;
  vectorDimension: number;

  // RAG Configuration
  topKResults: number;
  chunkSize: number;
  chunkOverlap: number;

  // Logging
  logLevel: string;
}

function getEnvVariable(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

export function loadConfig(): ModelConfig {
  const config: ModelConfig = {
    port: getEnvNumber('PORT', 3000),
    nodeEnv: getEnvVariable('NODE_ENV', 'development'),
    model: getEnvVariable('MODEL', 'llama3'),
    ollamaBaseUrl: getEnvVariable('OLLAMA_BASE_URL', 'http://localhost:11434'),
    embeddingModel: getEnvVariable('EMBEDDING_MODEL', 'Xenova/bge-base-en-v1.5'),
    lancedbPath: getEnvVariable('LANCEDB_PATH', './data/lancedb'),
    vectorDimension: getEnvNumber('VECTOR_DIMENSION', 768),
    topKResults: getEnvNumber('TOP_K_RESULTS', 5),
    chunkSize: getEnvNumber('CHUNK_SIZE', 1000),
    chunkOverlap: getEnvNumber('CHUNK_OVERLAP', 200),
    logLevel: getEnvVariable('LOG_LEVEL', 'info'),
  };

  // Only log if not in MCP mode
  if (process.env.MCP_SERVER !== 'true') {
    logger.info('Configuration loaded', {
      port: config.port,
      nodeEnv: config.nodeEnv,
      model: config.model,
      embeddingModel: config.embeddingModel,
    });
  }

  return config;
}

export const config = loadConfig();

export default config;

