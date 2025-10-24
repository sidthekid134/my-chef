import * as SQLite from 'expo-sqlite';
import { executeSql, executeInTransaction, getDatabase } from '../db/Database';
import {
  Recipe,
  Ingredient,
  Step,
  RecipeWithDetails,
  RecipeFilter,
  PaginatedRecipes,
  RecipePagination
} from '../models/RecipeModels';

/**
 * Data Access Object for Recipe-related database operations
 */
export class RecipeDAO {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Get all recipes with pagination
   * @param filter Optional filter parameters
   */
  async getRecipes(filter?: RecipeFilter): Promise<PaginatedRecipes> {
    const {
      searchTerm = '',
      prepTimeMaxMinutes,
      cookTimeMaxMinutes,
      limit = 20,
      offset = 0
    } = filter || {};

    // Build query conditions
    const conditions: string[] = [];
    const params: any[] = [];

    if (searchTerm) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (prepTimeMaxMinutes !== undefined) {
      conditions.push('prep_time_minutes <= ?');
      params.push(prepTimeMaxMinutes);
    }

    if (cookTimeMaxMinutes !== undefined) {
      conditions.push('cook_time_minutes <= ?');
      params.push(cookTimeMaxMinutes);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM recipes ${whereClause}`;
    const countResult = await executeSql(this.db, countQuery, params);
    const total = countResult.rows.item(0).total;

    // Get paginated recipes
    const query = `
      SELECT * FROM recipes
      ${whereClause}
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, limit, offset];
    const result = await executeSql(this.db, query, queryParams);

    // Convert results to Recipe objects
    const recipes: Recipe[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      recipes.push(this.mapRowToRecipe(result.rows.item(i)));
    }

    // Get full details (ingredients and steps) for each recipe
    const recipesWithDetails: RecipeWithDetails[] = [];
    for (const recipe of recipes) {
      recipesWithDetails.push(await this.getRecipeWithDetails(recipe.id!));
    }

    // Create pagination metadata
    const pagination: RecipePagination = {
      total,
      limit,
      offset,
      hasMore: offset + recipes.length < total
    };

    return {
      recipes: recipesWithDetails,
      pagination
    };
  }

  /**
   * Get a recipe by ID with all its details (ingredients and steps)
   * @param id Recipe ID
   */
  async getRecipeWithDetails(id: number): Promise<RecipeWithDetails> {
    // Get recipe
    const recipeQuery = 'SELECT * FROM recipes WHERE id = ?';
    const recipeResult = await executeSql(this.db, recipeQuery, [id]);

    if (recipeResult.rows.length === 0) {
      throw new Error(`Recipe with ID ${id} not found`);
    }

    const recipe = this.mapRowToRecipe(recipeResult.rows.item(0));

    // Get ingredients
    const ingredientsQuery = 'SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY order_index';
    const ingredientsResult = await executeSql(this.db, ingredientsQuery, [id]);

    const ingredients: Ingredient[] = [];
    for (let i = 0; i < ingredientsResult.rows.length; i++) {
      ingredients.push(this.mapRowToIngredient(ingredientsResult.rows.item(i)));
    }

    // Get steps
    const stepsQuery = 'SELECT * FROM steps WHERE recipe_id = ? ORDER BY order_index';
    const stepsResult = await executeSql(this.db, stepsQuery, [id]);

    const steps: Step[] = [];
    for (let i = 0; i < stepsResult.rows.length; i++) {
      steps.push(this.mapRowToStep(stepsResult.rows.item(i)));
    }

    return {
      ...recipe,
      ingredients,
      steps
    };
  }

  /**
   * Create a new recipe with ingredients and steps
   * @param recipe Recipe to create
   */
  async createRecipe(recipe: RecipeWithDetails): Promise<RecipeWithDetails> {
    return executeInTransaction(this.db, async () => {
      const now = new Date().toISOString();

      // Insert recipe
      const recipeResult = await executeSql(
        this.db,
        `INSERT INTO recipes (
          title, description, servings, prep_time_minutes, cook_time_minutes,
          image_url, source_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipe.title,
          recipe.description,
          recipe.servings,
          recipe.prepTimeMinutes,
          recipe.cookTimeMinutes,
          recipe.imageUrl || null,
          recipe.sourceUrl || null,
          now,
          now
        ]
      );

      const recipeId = recipeResult.insertId!;

      // Insert ingredients
      for (let i = 0; i < recipe.ingredients.length; i++) {
        const ingredient = recipe.ingredients[i];
        await executeSql(
          this.db,
          `INSERT INTO ingredients (
            recipe_id, name, quantity, unit, notes, order_index
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            recipeId,
            ingredient.name,
            ingredient.quantity,
            ingredient.unit,
            ingredient.notes || null,
            ingredient.order || i
          ]
        );
      }

      // Insert steps
      for (let i = 0; i < recipe.steps.length; i++) {
        const step = recipe.steps[i];
        await executeSql(
          this.db,
          `INSERT INTO steps (
            recipe_id, description, order_index, image_url, notes
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            recipeId,
            step.description,
            step.order || i,
            step.imageUrl || null,
            step.notes || null
          ]
        );
      }

      // Return the created recipe with its ID
      return this.getRecipeWithDetails(recipeId);
    });
  }

  /**
   * Update an existing recipe with ingredients and steps
   * @param recipe Recipe to update
   */
  async updateRecipe(recipe: RecipeWithDetails): Promise<RecipeWithDetails> {
    if (!recipe.id) {
      throw new Error('Recipe ID is required for update');
    }

    return executeInTransaction(this.db, async () => {
      const now = new Date().toISOString();

      // Update recipe
      await executeSql(
        this.db,
        `UPDATE recipes SET
          title = ?,
          description = ?,
          servings = ?,
          prep_time_minutes = ?,
          cook_time_minutes = ?,
          image_url = ?,
          source_url = ?,
          updated_at = ?
        WHERE id = ?`,
        [
          recipe.title,
          recipe.description,
          recipe.servings,
          recipe.prepTimeMinutes,
          recipe.cookTimeMinutes,
          recipe.imageUrl || null,
          recipe.sourceUrl || null,
          now,
          recipe.id
        ]
      );

      // Delete existing ingredients and steps
      await executeSql(this.db, 'DELETE FROM ingredients WHERE recipe_id = ?', [recipe.id]);
      await executeSql(this.db, 'DELETE FROM steps WHERE recipe_id = ?', [recipe.id]);

      // Insert updated ingredients
      for (let i = 0; i < recipe.ingredients.length; i++) {
        const ingredient = recipe.ingredients[i];
        await executeSql(
          this.db,
          `INSERT INTO ingredients (
            recipe_id, name, quantity, unit, notes, order_index
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            recipe.id,
            ingredient.name,
            ingredient.quantity,
            ingredient.unit,
            ingredient.notes || null,
            ingredient.order || i
          ]
        );
      }

      // Insert updated steps
      for (let i = 0; i < recipe.steps.length; i++) {
        const step = recipe.steps[i];
        await executeSql(
          this.db,
          `INSERT INTO steps (
            recipe_id, description, order_index, image_url, notes
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            recipe.id,
            step.description,
            step.order || i,
            step.imageUrl || null,
            step.notes || null
          ]
        );
      }

      // Return the updated recipe
      return this.getRecipeWithDetails(recipe.id);
    });
  }

  /**
   * Delete a recipe and its related data
   * @param id Recipe ID
   */
  async deleteRecipe(id: number): Promise<boolean> {
    return executeInTransaction(this.db, async () => {
      // With foreign key constraints and ON DELETE CASCADE,
      // we only need to delete the recipe
      const result = await executeSql(
        this.db,
        'DELETE FROM recipes WHERE id = ?',
        [id]
      );

      return result.rowsAffected > 0;
    });
  }

  /**
   * Map a database row to a Recipe object
   * @param row Database row
   */
  private mapRowToRecipe(row: any): Recipe {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      servings: row.servings,
      prepTimeMinutes: row.prep_time_minutes,
      cookTimeMinutes: row.cook_time_minutes,
      imageUrl: row.image_url,
      sourceUrl: row.source_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Map a database row to an Ingredient object
   * @param row Database row
   */
  private mapRowToIngredient(row: any): Ingredient {
    return {
      id: row.id,
      recipeId: row.recipe_id,
      name: row.name,
      quantity: row.quantity,
      unit: row.unit,
      notes: row.notes,
      order: row.order_index
    };
  }

  /**
   * Map a database row to a Step object
   * @param row Database row
   */
  private mapRowToStep(row: any): Step {
    return {
      id: row.id,
      recipeId: row.recipe_id,
      description: row.description,
      order: row.order_index,
      imageUrl: row.image_url,
      notes: row.notes
    };
  }
}