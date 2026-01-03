/**
 * LLM Client Abstraction
 * 
 * Provides a unified interface for different LLM providers.
 * Supports OpenAI, Anthropic, and Google Gemini.
 */

type LLMProvider = 'openai' | 'anthropic' | 'gemini';

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
      case 'gemini':
        return this.generateGemini(messages, options);
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

  /**
   * List available Gemini models for this API key
   */
  private async listAvailableGeminiModels(): Promise<string[]> {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.config.apiKey);
      
      // Use the SDK's listModels method if available
      // Otherwise, try to fetch from the API directly
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + this.config.apiKey);
      if (response.ok) {
        const data = await response.json();
        const models = data.models?.map((m: any) => m.name?.replace('models/', '') || m.name) || [];
        console.log(`[LLMClient] Found ${models.length} available models:`, models);
        return models;
      }
    } catch (error) {
      console.error('[LLMClient] Error listing models:', error);
    }
    return [];
  }

  private async generateGemini(
    messages: LLMMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(this.config.apiKey);
    
    // First, try to get list of available models
    console.log(`[LLMClient] Fetching available models for this API key...`);
    const availableModels = await this.listAvailableGeminiModels();
    
    // Build list of models to try
    let modelsToTry: string[] = [];
    
    // If we got available models, use those first
    if (availableModels.length > 0) {
      // Filter to only text generation models (not vision, etc.)
      const textModels = availableModels.filter((m: string) => 
        m.includes('gemini') && !m.includes('vision') && !m.includes('embedding')
      );
      modelsToTry = [...textModels];
      console.log(`[LLMClient] Using ${textModels.length} available text models:`, textModels);
    }
    
    // Add fallback models if we didn't get any or as backup
    const fallbackModels = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-002',
      'gemini-1.5-flash-001',
    ];
    
    // Add fallbacks that aren't already in the list
    modelsToTry = [...modelsToTry, ...fallbackModels.filter(m => !modelsToTry.includes(m))];
    
    // If a specific model is configured, try it first
    const requestedModel = this.config.model;
    if (requestedModel && !modelsToTry.includes(requestedModel)) {
      modelsToTry.unshift(requestedModel);
    }
    
    console.log(`[LLMClient] Will try these models in order:`, modelsToTry);
    
    let lastError: any = null;
    
    // Try each model
    for (const tryModelName of modelsToTry) {
      try {
        console.log(`[LLMClient] Attempting model: ${tryModelName}`);
        const model = genAI.getGenerativeModel({ 
          model: tryModelName,
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens ?? 3000,
          },
        });

        // Separate system message and conversation messages
        const systemMessage = messages.find(m => m.role === 'system');
        const conversationMessages = messages.filter(m => m.role !== 'system');
        
        // Build the prompt with system message first
        let fullPrompt = '';
        if (systemMessage) {
          fullPrompt += `${systemMessage.content}\n\n`;
        }
        
        // Add conversation history
        for (const msg of conversationMessages) {
          if (msg.role === 'user') {
            fullPrompt += `${msg.content}\n\n`;
          } else if (msg.role === 'assistant') {
            fullPrompt += `${msg.content}\n\n`;
          }
        }

        console.log(`[LLMClient] Calling Gemini API with model: ${tryModelName}`);
        console.log(`[LLMClient] Prompt length: ${fullPrompt.length} chars`);
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        console.log(`[LLMClient] ✅ Success with model: ${tryModelName}`);
        console.log(`[LLMClient] Gemini response received (length: ${text.length})`);
        return text;
      } catch (error: any) {
        console.error(`[LLMClient] ❌ Failed with model ${tryModelName}:`, error.message);
        lastError = error;
        // Continue to next model
        continue;
      }
    }
    
    // If all models failed, throw the last error
    console.error(`[LLMClient] All model attempts failed. Last error:`, lastError);
    throw new Error(`Gemini API error: All model attempts failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }
}

/**
 * Create an LLM client from environment variables
 * Priority: GEMINI_API_KEY > OPENAI_API_KEY > ANTHROPIC_API_KEY
 */
export function createLLMClient(): LLMClient {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (geminiKey) {
    console.log('[LLMClient] Using Gemini API (GEMINI_API_KEY found)');
    // Default to gemini-2.5-flash (fast and reliable)
    // If GEMINI_MODEL is set, use it; otherwise default to gemini-2.5-flash
    // The code will automatically fetch available models and try them if the first one fails
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    console.log(`[LLMClient] Gemini model configured: ${model}`);
    console.log(`[LLMClient] Using gemini-2.5-flash as default model`);
    return new LLMClient({
      provider: 'gemini',
      apiKey: geminiKey,
      model: 'gemini-2.5-flash', // Always use gemini-2.5-flash unless GEMINI_MODEL is explicitly set
    });
  }

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

  throw new Error('No LLM API key found. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in environment variables.');
}

