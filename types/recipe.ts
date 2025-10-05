import { z } from 'zod';

/**
 * TypeScript interface for Recipe
 */
export interface Recipe {
  id: string;
  title: string;
  servings: string;
  totalTimeMinutes: number;
  activeTimeMinutes: number | null;
  passiveTimeMinutes: number | null;
  metadata: {
    cuisine: string;
    dishType: string;
    difficultyLevel: string;
  };
  ingredients: Array<{
    name: string;
    quantity: string;
    type: string;
  }>;
  steps: Array<{
    stepNumber: number;
    title: string;
    equipmentNeeded: string[];
    instructions: string;
    ingredientsUsed: Array<{
      name: string;
      quantity: string;
      type: string;
    }>;
    estimatedTimeMinutes: number;
    definitionOfDone: string;
  }>;
  allEquipmentNeeded: string[];
}

/**
 * Zod schema for Ingredient
 */
export const IngredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  type: z.string(),
});

/**
 * Zod schema for Step
 */
export const StepSchema = z.object({
  stepNumber: z.number().int(),
  title: z.string(),
  equipmentNeeded: z.array(z.string()),
  instructions: z.string(),
  ingredientsUsed: z.array(IngredientSchema),
  estimatedTimeMinutes: z.number().int(),
  definitionOfDone: z.string(),
});

/**
 * Zod schema for Recipe metadata
 */
export const RecipeMetadataSchema = z.object({
  cuisine: z.string(),
  dishType: z.string(),
  difficultyLevel: z.string(),
});

/**
 * Zod schema for Recipe
 */
export const RecipeSchema = z.object({
  id: z.string().describe("Unique identifier for the recipe"),
  title: z.string().describe("Title of the recipe"),
  servings: z.string().describe("Number of servings"),
  totalTimeMinutes: z.number().int().describe("Total time required in minutes"),
  activeTimeMinutes: z.number().int().nullable().describe("Active cooking time in minutes (optional)"),
  passiveTimeMinutes: z.number().int().nullable().describe("Passive cooking time in minutes (optional)"),
  metadata: RecipeMetadataSchema,
  ingredients: z.array(IngredientSchema),
  steps: z.array(StepSchema),
  allEquipmentNeeded: z.array(z.string()),
});

/**
 * Type for Recipe from Zod schema
 */
export type RecipeType = z.infer<typeof RecipeSchema>;

/**
 * Validate a Recipe object using Zod schema
 */
export function validateRecipe(data: unknown): { success: boolean; data?: Recipe; error?: string } {
  try {
    const validatedRecipe = RecipeSchema.parse(data);
    return { success: true, data: validatedRecipe };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred during validation' };
  }
}

/**
 * Parse Recipe input data and validate using Zod schema
 */
export function parseRecipeInput(data: unknown): Recipe {
  return RecipeSchema.parse(data);
}

/**
 * Serialize a Recipe object for output
 */
export function serializeRecipe(recipe: Recipe): Record<string, unknown> {
  return RecipeSchema.parse(recipe);
}