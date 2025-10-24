import {
  Recipe,
  RecipeWithDetails,
  RecipeFilter,
  PaginatedRecipes
} from '../models/RecipeModels';
import { RecipeDAO } from '../dao/RecipeDAO';

/**
 * Recipe Repository interface defining methods for recipe management
 */
export interface IRecipeRepository {
  /**
   * Get recipes with pagination and optional filtering
   * @param filter Optional filter parameters
   */
  getRecipes(filter?: RecipeFilter): Promise<PaginatedRecipes>;

  /**
   * Get a specific recipe by ID with all details
   * @param id Recipe ID
   */
  getRecipeById(id: number): Promise<RecipeWithDetails>;

  /**
   * Create a new recipe
   * @param recipe Recipe to create
   */
  createRecipe(recipe: RecipeWithDetails): Promise<RecipeWithDetails>;

  /**
   * Update an existing recipe
   * @param recipe Recipe to update
   */
  updateRecipe(recipe: RecipeWithDetails): Promise<RecipeWithDetails>;

  /**
   * Delete a recipe by ID
   * @param id Recipe ID
   */
  deleteRecipe(id: number): Promise<boolean>;
}

/**
 * Implementation of the Recipe Repository
 */
export class RecipeRepository implements IRecipeRepository {
  private recipeDAO: RecipeDAO;

  constructor() {
    this.recipeDAO = new RecipeDAO();
  }

  /**
   * Get recipes with pagination and optional filtering
   * @param filter Optional filter parameters
   */
  async getRecipes(filter?: RecipeFilter): Promise<PaginatedRecipes> {
    return this.recipeDAO.getRecipes(filter);
  }

  /**
   * Get a specific recipe by ID with all details
   * @param id Recipe ID
   */
  async getRecipeById(id: number): Promise<RecipeWithDetails> {
    return this.recipeDAO.getRecipeWithDetails(id);
  }

  /**
   * Create a new recipe
   * @param recipe Recipe to create
   */
  async createRecipe(recipe: RecipeWithDetails): Promise<RecipeWithDetails> {
    return this.recipeDAO.createRecipe(recipe);
  }

  /**
   * Update an existing recipe
   * @param recipe Recipe to update
   */
  async updateRecipe(recipe: RecipeWithDetails): Promise<RecipeWithDetails> {
    return this.recipeDAO.updateRecipe(recipe);
  }

  /**
   * Delete a recipe by ID
   * @param id Recipe ID
   */
  async deleteRecipe(id: number): Promise<boolean> {
    return this.recipeDAO.deleteRecipe(id);
  }
}