/**
 * URL-based Recipe Ingestion API Route
 * Accepts a URL, fetches its content, and processes it with the LLM service
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService, ProviderType } from '../../../../../lib/llm/LLMService';
import { Recipe } from '../../../../../types/recipe';
import { fetchContent } from '../../../../../lib/contentFetcher';
import { v4 as uuidv4 } from 'uuid';

// Validation schema for URL request
const UrlRequestSchema = z.object({
  url: z.string().url('A valid URL is required'),
  provider: z.nativeEnum(ProviderType).optional(),
  temperature: z.number().min(0).max(1).optional(),
});

// Validate the environment variables
const validateEnv = () => {
  const requiredVars = ['OPENAI_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }
};

/**
 * POST handler for URL-based recipe ingestion
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnv();
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body against the schema
    const validationResult = UrlRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request data',
          errors: validationResult.error.errors
        },
        { status: 400 }
      );
    }
    
    const { url, provider, temperature } = validationResult.data;
    
    // Fetch content from the URL
    let content: string;
    try {
      content = await fetchContent(url);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to fetch URL content', 
          error: error instanceof Error ? error.message : String(error)
        },
        { status: 400 }
      );
    }
    
    // Initialize the LLM service
    const llmService = new LLMService({
      providers: {
        [ProviderType.OpenAI]: {
          apiKey: process.env.OPENAI_API_KEY!,
          modelName: process.env.OPENAI_MODEL_NAME || 'gpt-4',
        }
      },
      defaultProvider: ProviderType.OpenAI,
    });
    
    await llmService.init();
    
    // Generate recipe from URL content
    let recipe: Recipe;
    try {
      recipe = await llmService.generateRecipeFromUrl(url, {
        provider: provider,
        temperature: temperature,
      });
      
      // Generate a unique ID for the recipe if not already present
      if (!recipe.id || recipe.id.startsWith('recipe-')) {
        recipe.id = uuidv4();
      }
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to generate recipe from URL', 
          error: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
    
    // Return the successful response
    return NextResponse.json(
      { success: true, data: recipe },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error processing URL recipe request:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}