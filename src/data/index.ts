import { initDatabase } from './db/Database';
import migrations from './migrations';
import { recipeRepository } from './repositories';

/**
 * Initialize the database and export all database-related modules
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await initDatabase(migrations);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export * from './models/RecipeModels';
export * from './repositories';
export { getDatabase, executeInTransaction } from './db/Database';