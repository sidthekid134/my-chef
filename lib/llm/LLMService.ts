/**
 * LLM Service
 * Provider-agnostic LLM service layer with request/response mapping and validation
 */
import { z } from 'zod';
import { CompletionRequest, IProvider } from './interfaces';
import { OpenAIProvider } from './providers';
import { RecipeSchema, safeValidateRecipe } from '../../schemas/recipe';
import { Recipe, RecipeInput } from '../../types/recipe';

/**
 * Available provider types
 */
export enum ProviderType {
  OpenAI = 'openai',
  // Additional providers can be added here as needed
}

/**
 * LLM Service configuration
 */
export interface LLMServiceConfig {
  providers: {
    [key in ProviderType]?: {
      apiKey: string;
      modelName?: string;
      [key: string]: any;
    };
  };
  defaultProvider: ProviderType;
}

/**
 * Recipe generation options
 */
export interface RecipeGenerationOptions {
  provider?: ProviderType;
  temperature?: number;
  maxTokens?: number;
  extraParams?: Record<string, any>;
  forceJson?: boolean;
}

/**
 * LLM Service class
 */
export class LLMService {
  private config: LLMServiceConfig;
  private providers: Map<ProviderType, IProvider>;
  
  /**
   * Create a new LLM Service instance
   */
  constructor(config: LLMServiceConfig) {
    this.config = config;
    this.providers = new Map();
  }
  
  /**
   * Initialize the LLM Service and all configured providers
   */
  async init(): Promise<void> {
    // Initialize the configured providers
    for (const [providerType, providerConfig] of Object.entries(this.config.providers)) {
      const provider = await this.createProvider(providerType as ProviderType, providerConfig);
      if (provider) {
        this.providers.set(providerType as ProviderType, provider);
      }
    }
    
    // Ensure we have at least the default provider
    if (!this.providers.has(this.config.defaultProvider)) {
      throw new Error(`Default provider ${this.config.defaultProvider} not configured`);
    }
  }
  
  /**
   * Create a provider instance based on the provider type
   */
  private async createProvider(
    type: ProviderType,
    config: Record<string, any>
  ): Promise<IProvider | null> {
    switch (type) {
      case ProviderType.OpenAI:
        const openaiProvider = new OpenAIProvider();
        await openaiProvider.init(config);
        return openaiProvider;
      
      default:
        console.warn(`Provider type ${type} not supported`);
        return null;
    }
  }
  
  /**
   * Get a provider by type
   */
  getProvider(type: ProviderType): IProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provider ${type} not initialized`);
    }
    return provider;
  }
  
  /**
   * Get the default provider
   */
  getDefaultProvider(): IProvider {
    return this.getProvider(this.config.defaultProvider);
  }
  
  /**
   * Generate a recipe from text
   */
  async generateRecipeFromText(
    text: string,
    options: RecipeGenerationOptions = {}
  ): Promise<Recipe> {
    const provider = options.provider 
      ? this.getProvider(options.provider) 
      : this.getDefaultProvider();
    
    // Create system prompt that enforces JSON output format
    const systemPrompt = this.createRecipeSystemPrompt(options.forceJson);
    
    // Create user prompt for recipe generation
    const userPrompt = this.createRecipeUserPrompt(text);
    
    // Generate the recipe
    return this.generateAndValidateRecipe(provider, systemPrompt, userPrompt, options);
  }
  
  /**
   * Generate a recipe from a URL
   */
  async generateRecipeFromUrl(
    url: string,
    options: RecipeGenerationOptions = {}
  ): Promise<Recipe> {
    const provider = options.provider 
      ? this.getProvider(options.provider) 
      : this.getDefaultProvider();
    
    // Create system prompt that enforces JSON output format
    const systemPrompt = this.createRecipeSystemPrompt(options.forceJson);
    
    // Create user prompt for recipe generation from URL
    const userPrompt = this.createRecipeUrlPrompt(url);
    
    // Generate the recipe
    return this.generateAndValidateRecipe(provider, systemPrompt, userPrompt, options);
  }
  
  /**
   * Generate a name for a recipe
   */
  async generateRecipeName(
    description: string,
    options: RecipeGenerationOptions = {}
  ): Promise<string> {
    const provider = options.provider 
      ? this.getProvider(options.provider) 
      : this.getDefaultProvider();
    
    const request: CompletionRequest = {
      systemPrompt: 'You are a creative recipe naming assistant. Generate a short, catchy name for the recipe described.',
      userPrompt: `Create a name for this recipe: ${description}`,
      temperature: options.temperature || 0.8,
      maxTokens: options.maxTokens || 50,
      extraParams: options.extraParams
    };
    
    const response = await provider.generateCompletion(request);
    return response.content.trim();
  }
  
  /**
   * Core method to generate and validate a recipe with auto-repair retry
   */
  private async generateAndValidateRecipe(
    provider: IProvider,
    systemPrompt: string,
    userPrompt: string,
    options: RecipeGenerationOptions
  ): Promise<Recipe> {
    const request: CompletionRequest = {
      systemPrompt,
      userPrompt,
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 4000,
      extraParams: options.extraParams
    };
    
    // First attempt
    const response = await provider.generateCompletion(request);
    
    // Parse the JSON and validate against our schema
    try {
      // Try to parse the response as JSON
      const jsonData = this.extractJsonFromResponse(response.content);
      
      // Validate with Zod
      const validationResult = safeValidateRecipe(jsonData);
      
      // If validation is successful, return the recipe
      if (validationResult.success) {
        return validationResult.data as Recipe;
      }
      
      // If validation fails, try to auto-repair
      return await this.retryWithValidationErrors(
        provider,
        systemPrompt,
        userPrompt,
        validationResult.error,
        jsonData,
        options
      );
      
    } catch (error) {
      // If JSON parsing fails, try again with a stronger JSON enforcement
      return await this.retryWithJsonEnforcement(
        provider,
        userPrompt,
        options
      );
    }
  }
  
  /**
   * Extract JSON from LLM response
   */
  private extractJsonFromResponse(content: string): any {
    // First, try to see if the whole response is valid JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      // If not, look for JSON within markdown code blocks
      const jsonMatch = content.match(/```(?:json)?([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch (e) {
          // If that fails, look for any text that looks like JSON
          const possibleJson = content.match(/{[\s\S]*}/);
          if (possibleJson) {
            try {
              return JSON.parse(possibleJson[0]);
            } catch (e) {
              // If all attempts fail, throw an error
              throw new Error('Could not parse JSON from LLM response');
            }
          } else {
            throw new Error('No JSON found in LLM response');
          }
        }
      } else {
        throw new Error('No JSON code block found in LLM response');
      }
    }
  }
  
  /**
   * Retry with validation errors for auto-repair
   */
  private async retryWithValidationErrors(
    provider: IProvider,
    systemPrompt: string,
    userPrompt: string,
    zodError: z.ZodError | undefined,
    originalJson: any,
    options: RecipeGenerationOptions
  ): Promise<Recipe> {
    if (!zodError) {
      throw new Error('Validation failed but no error details were provided');
    }
    
    // Format Zod errors for LLM
    const errorMessages = zodError.errors.map(err => 
      `- Path "${err.path.join('.')}": ${err.message}`
    ).join('\n');
    
    // Create a refined prompt with the error information
    const retryPrompt = `
The JSON output you provided has validation errors. Please fix the following issues and provide a corrected JSON:

${errorMessages}

Original JSON:
${JSON.stringify(originalJson, null, 2)}

Please provide a corrected version that fixes ALL validation issues. Return ONLY the JSON with no explanations.`;
    
    // Make a retry request
    const retryRequest: CompletionRequest = {
      systemPrompt,
      userPrompt: retryPrompt,
      temperature: 0.3, // Lower temperature for more deterministic output
      maxTokens: options.maxTokens || 4000,
      extraParams: options.extraParams
    };
    
    const retryResponse = await provider.generateCompletion(retryRequest);
    
    try {
      // Parse and validate the retry response
      const jsonData = this.extractJsonFromResponse(retryResponse.content);
      const validationResult = safeValidateRecipe(jsonData);
      
      if (validationResult.success) {
        return validationResult.data as Recipe;
      } else {
        // If still invalid after retry, throw error with validation details
        const formattedError = validationResult.error?.errors.map(err => 
          `Path "${err.path.join('.')}": ${err.message}`
        ).join('\n');
        
        throw new Error(`Failed to auto-repair recipe validation issues:\n${formattedError}`);
      }
    } catch (error) {
      // If any parsing fails in the retry, throw with details
      throw new Error(`Failed to parse auto-repaired recipe: ${error.message}`);
    }
  }
  
  /**
   * Retry with stronger JSON enforcement
   */
  private async retryWithJsonEnforcement(
    provider: IProvider,
    originalPrompt: string,
    options: RecipeGenerationOptions
  ): Promise<Recipe> {
    // Create a stronger system prompt that emphasizes JSON format
    const strictSystemPrompt = this.createRecipeSystemPrompt(true, true);
    
    // Create a refined user prompt that emphasizes JSON
    const retryPrompt = `
Your previous response could not be parsed as valid JSON. Please try again.

${originalPrompt}

IMPORTANT: Your response MUST be valid JSON that matches the Recipe schema. Do not include any explanations or markdown formatting - just the JSON object.`;
    
    // Make a retry request
    const retryRequest: CompletionRequest = {
      systemPrompt: strictSystemPrompt,
      userPrompt: retryPrompt,
      temperature: 0.3, // Lower temperature for more deterministic output
      maxTokens: options.maxTokens || 4000,
      extraParams: options.extraParams
    };
    
    const retryResponse = await provider.generateCompletion(retryRequest);
    
    try {
      // Parse and validate the retry response
      const jsonData = this.extractJsonFromResponse(retryResponse.content);
      const validationResult = safeValidateRecipe(jsonData);
      
      if (validationResult.success) {
        return validationResult.data as Recipe;
      } else {
        // If still invalid after retry, throw error with validation details
        const formattedError = validationResult.error?.errors.map(err => 
          `Path "${err.path.join('.')}": ${err.message}`
        ).join('\n');
        
        throw new Error(`Failed to generate valid recipe JSON:\n${formattedError}`);
      }
    } catch (error) {
      // If any parsing fails in the retry, throw with details
      throw new Error(`Failed to parse recipe JSON after enforcement: ${error.message}`);
    }
  }
  
  /**
   * Create a system prompt for recipe generation
   */
  private createRecipeSystemPrompt(forceJson = false, strict = false): string {
    // Schema representation in TypeScript format
    const schemaRepresentation = `
interface Ingredient {
  name: string;        // Required, non-empty
  quantity: string;    // Required, non-empty
  type: string;        // Required, non-empty
}

interface RecipeStep {
  stepNumber: number;  // Required, positive integer
  title: string;       // Required, non-empty
  equipmentNeeded: string[];  // Required array
  instructions: string;  // Required, non-empty
  ingredientsUsed: Ingredient[];  // Required array of ingredients
  estimatedTimeMinutes: number;  // Required, non-negative integer
  definitionOfDone: string;  // Required, non-empty
}

interface RecipeMetadata {
  cuisine: string;     // Required, non-empty
  dishType: string;    // Required, non-empty
  difficultyLevel: string;  // Required, non-empty
}

interface Recipe {
  id: string;          // Required, non-empty (will be provided by the system, use a placeholder)
  title: string;       // Required, non-empty
  servings: string;    // Required, non-empty
  totalTimeMinutes: number;  // Required, positive integer
  activeTimeMinutes: number | null;  // Optional, non-negative if provided
  passiveTimeMinutes: number | null;  // Optional, non-negative if provided
  metadata: RecipeMetadata;  // Required
  ingredients: Ingredient[];  // Required, non-empty array
  steps: RecipeStep[];  // Required, non-empty array
  allEquipmentNeeded: string[];  // Required array
}`;
    
    // Base system prompt
    const basePrompt = `You are a professional chef assistant that specializes in converting recipes into structured data. Your task is to analyze recipes and output them in a standardized JSON format.

The JSON output must strictly follow this schema:
${schemaRepresentation}

Important requirements:
1. Your response MUST be valid JSON that matches the Recipe schema.
2. For 'id' field, use a placeholder like "recipe-123" since the real ID will be assigned by the system.
3. All time values must be in minutes, as integers.
4. Steps must be ordered sequentially, starting from 1.
5. Include all equipment across all steps in the 'allEquipmentNeeded' array.
6. Make sure all required fields have valid values.
${strict ? '7. DO NOT include any explanations or text outside the JSON object.\n8. DO NOT use markdown formatting around the JSON.\n9. Return ONLY the valid JSON object.' : ''}`;
    
    // JSON enforcement addon
    const jsonEnforcement = forceJson ? `
Output format requirements:
1. Your output MUST be valid JSON, no markdown formatting.
2. Do not include \`\`\`json or \`\`\` around your response.
3. Return ONLY the JSON object with no surrounding text.
4. No explanations before or after the JSON.` : '';
    
    return basePrompt + jsonEnforcement;
  }
  
  /**
   * Create a user prompt for recipe generation from text
   */
  private createRecipeUserPrompt(text: string): string {
    return `Convert the following recipe into the standardized JSON format:

${text}

Please extract all the recipe details carefully, including ingredients, steps, equipment needed, and timing information. Make reasonable estimates for any missing information based on similar recipes.`;
  }
  
  /**
   * Create a user prompt for recipe generation from URL
   */
  private createRecipeUrlPrompt(url: string): string {
    return `Convert the recipe from this URL into the standardized JSON format:

${url}

Please extract all the recipe details carefully, including ingredients, steps, equipment needed, and timing information. Make reasonable estimates for any missing information based on similar recipes.`;
  }
}