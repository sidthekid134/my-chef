/**
 * LLM Provider interfaces
 * Defines the contract for all LLM providers (OpenAI, Gemini, etc.)
 */

/**
 * Base configuration for all LLM providers
 */
export interface ProviderConfig {
  apiKey: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Request options for LLM completions
 */
export interface CompletionRequest {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  extraParams?: Record<string, any>;
}

/**
 * Response from LLM providers
 */
export interface CompletionResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  raw?: any; // Raw response from the provider
}

/**
 * Provider interface that all LLM implementations must follow
 */
export interface IProvider {
  /**
   * Configuration for this provider
   */
  config: ProviderConfig;
  
  /**
   * Initialize the provider with configuration
   */
  init(config: ProviderConfig): Promise<void>;
  
  /**
   * Generate a completion from the LLM
   */
  generateCompletion(request: CompletionRequest): Promise<CompletionResponse>;
}