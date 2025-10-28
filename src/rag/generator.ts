import { Ollama } from 'ollama';
import { logger } from '../config/logger.js';
import { config } from '../config/modelConfig.js';
import { RetrievalResult } from './retriever.js';

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface GenerateResponse {
  answer: string;
  contextUsed: RetrievalResult[];
}

export class Generator {
  private ollama: Ollama;
  private model: string;

  constructor(model?: string, baseUrl?: string) {
    this.model = model || config.model;
    this.ollama = new Ollama({
      host: baseUrl || config.ollamaBaseUrl,
    });
  }

  async initialize(): Promise<void> {
    try {
      logger.info(`Verifying Ollama connection and model: ${this.model}`);
      
      // Test connection by listing models
      await this.ollama.list();
      
      logger.info('Ollama connection verified successfully');
    } catch (error) {
      logger.error('Failed to connect to Ollama', { error });
      throw new Error(
        `Failed to connect to Ollama at ${config.ollamaBaseUrl}. ` +
        `Make sure Ollama is running (ollama serve) and the model '${this.model}' is installed.`
      );
    }
  }

  async generate(
    query: string,
    context: RetrievalResult[],
    options?: GenerateOptions
  ): Promise<GenerateResponse> {
    try {
      logger.info(`Generating answer for query: "${query}"`);

      const prompt = this.constructPrompt(query, context);
      
      const response = await this.ollama.generate({
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 500,
        },
      });

      const answer = response.response;
      
      logger.info('Answer generated successfully');
      
      return {
        answer,
        contextUsed: context,
      };
    } catch (error) {
      logger.error('Failed to generate answer', { error });
      throw new Error(`Failed to generate answer: ${error}`);
    }
  }

  async *generateStream(
    query: string,
    context: RetrievalResult[],
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    try {
      logger.info(`Generating streaming answer for query: "${query}"`);

      const prompt = this.constructPrompt(query, context);

      const stream = await this.ollama.generate({
        model: this.model,
        prompt,
        stream: true,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 500,
        },
      });

      for await (const chunk of stream) {
        if (chunk.response) {
          yield chunk.response;
        }
      }

      logger.info('Streaming answer completed');
    } catch (error) {
      logger.error('Failed to generate streaming answer', { error });
      throw new Error(`Failed to generate streaming answer: ${error}`);
    }
  }

  private constructPrompt(query: string, context: RetrievalResult[]): string {
    if (context.length === 0) {
      return `You are a helpful assistant. Answer the following question to the best of your ability.

Question: ${query}

Answer:`;
    }

    // Combine context from retrieved documents
    const contextText = context
      .map((result, index) => {
        const source = result.metadata.source || 'Unknown';
        return `[${index + 1}] Source: ${source}\n${result.content}`;
      })
      .join('\n\n');

    return `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer based on the context, just say that you don't know. Use three sentences maximum and keep the answer concise.

Context:
${contextText}

Question: ${query}

Answer:`;
  }

  getModelName(): string {
    return this.model;
  }

  isReady(): boolean {
    return true; // Ollama connection is stateless
  }
}

export default Generator;

