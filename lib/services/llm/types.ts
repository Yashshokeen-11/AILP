/**
 * LLM Service Types
 * 
 * Type definitions for the LLM abstraction layer.
 * Allows switching between different LLM providers easily.
 */

export type LLMProvider = 'openai' | 'anthropic' | 'local';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMClient {
  chat(messages: LLMMessage[], config?: Partial<LLMConfig>): Promise<LLMResponse>;
}

