/**
 * OpenAI Provider Implementation
 * Implements the IProvider interface for OpenAI
 */
import { CompletionRequest, CompletionResponse, IProvider, ProviderConfig } from '../interfaces';

/**
 * OpenAI-specific configuration
 */
export interface OpenAIConfig extends ProviderConfig {
  apiVersion?: string;
  organization?: string;
  baseUrl?: string;
}

/**
 * OpenAI provider implementation
 */
export class OpenAIProvider implements IProvider {
  config: OpenAIConfig;
  
  constructor(config?: OpenAIConfig) {
    this.config = config || {
      apiKey: '',
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 2048
    };
  }
  
  /**
   * Initialize the OpenAI provider with configuration
   */
  async init(config: OpenAIConfig): Promise<void> {
    this.config = {
      ...this.config,
      ...config
    };
  }
  
  /**
   * Generate a completion from OpenAI
   */
  async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    const url = this.config.baseUrl || 'https://api.openai.com/v1/chat/completions';
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`
    };
    
    if (this.config.organization) {
      headers['OpenAI-Organization'] = this.config.organization;
    }
    
    const messages = [];
    
    // Add system prompt if provided
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt
      });
    }
    
    // Add user prompt
    messages.push({
      role: 'user',
      content: request.userPrompt
    });
    
    const requestBody = {
      model: this.config.modelName,
      messages,
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens ?? this.config.maxTokens,
      ...request.extraParams
    };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Format the response to match our CompletionResponse interface
      return {
        content: data.choices[0]?.message?.content || '',
        model: data.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        raw: data // Include raw response for debugging
      };
    } catch (error) {
      throw new Error(`Failed to generate completion: ${error.message}`);
    }
  }
}