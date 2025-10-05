import type { Recipe } from '@/types/recipe';

/**
 * API client for recipes
 */
export const recipeApi = {
  /**
   * Fetch all recipes
   * @returns Promise with recipe data
   */
  async getRecipes(): Promise<Recipe[]> {
    const response = await fetch('/api/v1/recipes');
    
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }
    
    return response.json();
  },

  /**
   * Fetch a single recipe by ID
   * @param id Recipe ID
   * @returns Promise with recipe data
   */
  async getRecipeById(id: string): Promise<Recipe> {
    const response = await fetch(`/api/v1/recipes/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recipe with ID: ${id}`);
    }
    
    return response.json();
  }
};