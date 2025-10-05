/**
 * Recipe Generation API Route
 * Accepts a dish name and generates a recipe with the LLM service
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService, ProviderType } from '../../../../../lib/llm/LLMService';
import { Recipe } from '../../../../../types/recipe';
import { v4 as uuidv4 } from 'uuid';

// Validation schema for generation request
const GenerationRequestSchema = z.object({
  dishName: z.string().min(3, 'Dish name must be at least 3 characters'),
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
 * POST handler for recipe generation from dish name
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnv();
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body against the schema
    const validationResult = GenerationRequestSchema.safeParse(body);
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
    
    const { dishName, provider, temperature } = validationResult.data;
    
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
    
    // Create a prompt for generating a recipe from a dish name
    const recipePrompt = `Create a detailed recipe for "${dishName}". 
Include ingredients, steps, equipment needed, and timing information.
Make the recipe complete, authentic, and delicious for home cooks.`;
    
    // Generate recipe from the prompt
    let recipe: Recipe;
    try {
      recipe = await llmService.generateRecipeFromText(recipePrompt, {
        provider: provider,
        temperature: temperature || 0.8, // Higher temperature for creativity
      });
      
      // Generate a unique ID for the recipe if not already present
      if (!recipe.id || recipe.id.startsWith('recipe-')) {
        recipe.id = uuidv4();
      }
      
      // Ensure the title matches the requested dish name
      if (recipe.title.toLowerCase() !== dishName.toLowerCase()) {
        recipe.title = dishName.charAt(0).toUpperCase() + dishName.slice(1);
      }
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to generate recipe', 
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
    console.error('Error processing recipe generation request:', error);
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