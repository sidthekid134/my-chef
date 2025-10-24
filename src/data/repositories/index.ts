import { RecipeRepository, IRecipeRepository } from './RecipeRepository';

/**
 * Create and export repository instances
 */
export const recipeRepository: IRecipeRepository = new RecipeRepository();

export {
  IRecipeRepository,
  RecipeRepository
};