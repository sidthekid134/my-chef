// This is a placeholder for the Recipe Zod schema that will be implemented in a future story
import { z } from 'zod';

// Basic recipe schema - will be expanded in future implementation
export const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export type RecipeInput = z.infer<typeof recipeSchema>;