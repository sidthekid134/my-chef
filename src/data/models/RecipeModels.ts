/**
 * Recipe-related database models
 */

/**
 * Recipe model interface representing a cooking recipe
 */
export interface Recipe {
  id?: number;
  title: string;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  imageUrl?: string;
  sourceUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Ingredient model interface for recipe ingredients
 */
export interface Ingredient {
  id?: number;
  recipeId: number;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  order: number; // For display ordering
}

/**
 * Step model interface for recipe preparation steps
 */
export interface Step {
  id?: number;
  recipeId: number;
  description: string;
  order: number; // For sequential ordering of steps
  imageUrl?: string;
  notes?: string;
}

/**
 * RecipeWithDetails interface combining Recipe with its Ingredients and Steps
 */
export interface RecipeWithDetails extends Recipe {
  ingredients: Ingredient[];
  steps: Step[];
}

/**
 * RecipeFilter interface for filtering recipes in queries
 */
export interface RecipeFilter {
  searchTerm?: string;
  prepTimeMaxMinutes?: number;
  cookTimeMaxMinutes?: number;
  limit?: number;
  offset?: number;
}

/**
 * Represents the pagination metadata for recipe queries
 */
export interface RecipePagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * The result of a paginated recipe query
 */
export interface PaginatedRecipes {
  recipes: RecipeWithDetails[];
  pagination: RecipePagination;
}