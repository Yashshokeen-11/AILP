/**
 * LLM Client Abstraction
 * 
 * Provides a unified interface for different LLM providers.
 * Currently supports OpenAI. Can be extended for Anthropic, local models, etc.
 * 
 * IMPORTANT: This abstracts LLM calls - business logic should NOT depend on specific providers.
 */

import { LLMClient, LLMMessage, LLMResponse, LLMConfig } from './types';

class OpenAIClient implements LLMClient {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: LLMMessage[], config?: Partial<LLMConfig>): Promise<LLMResponse> {
    const model = config?.model || 'gpt-4o-mini';
    const temperature = config?.temperature ?? 0.7;
    const maxTokens = config?.maxTokens ?? 2000;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('LLM API call failed:', error);
      throw error;
    }
  }
}

/**
 * Create LLM client based on configuration
 */
export function createLLMClient(config: LLMConfig): LLMClient {
  if (config.provider === 'openai') {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    return new OpenAIClient(config.apiKey);
  }

  // Add other providers here (Anthropic, local, etc.)
  throw new Error(`Unsupported LLM provider: ${config.provider}`);
}

/**
 * Get default LLM client from environment variables
 */
export function getDefaultLLMClient(): LLMClient {
  const provider = (process.env.LLM_PROVIDER || 'openai') as LLMConfig['provider'];
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('LLM API key not found in environment variables');
  }

  return createLLMClient({
    provider,
    apiKey,
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  });
}

