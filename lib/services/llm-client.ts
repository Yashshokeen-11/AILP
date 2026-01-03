/**
 * LLM Client Abstraction
 * 
 * Provides a unified interface for different LLM providers.
 * Currently supports OpenAI and Anthropic, with easy extension.
 */

type LLMProvider = 'openai' | 'anthropic';

interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * Generate a response from the LLM
   */
  async generate(messages: LLMMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    switch (this.config.provider) {
      case 'openai':
        return this.generateOpenAI(messages, options);
      case 'anthropic':
        return this.generateAnthropic(messages, options);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async generateOpenAI(
    messages: LLMMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`OpenAI API error: ${error.error?.message || 'Failed to generate response'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async generateAnthropic(
    messages: LLMMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    // Filter out system messages (Anthropic handles them differently)
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: options?.maxTokens ?? 2000,
        temperature: options?.temperature ?? 0.7,
        system: systemMessage?.content || '',
        messages: conversationMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Anthropic API error: ${error.error?.message || 'Failed to generate response'}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }
}

/**
 * Create an LLM client from environment variables
 */
export function createLLMClient(): LLMClient {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    return new LLMClient({
      provider: 'openai',
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL || 'gpt-4',
    });
  }

  if (anthropicKey) {
    return new LLMClient({
      provider: 'anthropic',
      apiKey: anthropicKey,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
    });
  }

  throw new Error('No LLM API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in environment variables.');
}

