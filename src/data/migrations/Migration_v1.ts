import * as SQLite from 'expo-sqlite';
import { executeSql, Migration } from '../db/Database';

/**
 * Initial database migration to create recipe-related tables
 */
export const migration_v1: Migration = {
  version: 1,
  migrate: async (db: SQLite.SQLiteDatabase): Promise<void> => {
    console.log('Running migration v1 - Creating recipe tables');

    // Create recipes table
    await executeSql(
      db,
      `CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        servings INTEGER NOT NULL DEFAULT 1,
        prep_time_minutes INTEGER NOT NULL DEFAULT 0,
        cook_time_minutes INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        source_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`
    );

    // Create ingredients table with foreign key to recipes
    await executeSql(
      db,
      `CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        notes TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
      );`
    );

    // Create steps table with foreign key to recipes
    await executeSql(
      db,
      `CREATE TABLE IF NOT EXISTS steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        notes TEXT,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
      );`
    );

    // Create indexes for improved query performance
    await executeSql(
      db,
      `CREATE INDEX idx_ingredients_recipe_id ON ingredients (recipe_id);`
    );

    await executeSql(
      db,
      `CREATE INDEX idx_steps_recipe_id ON steps (recipe_id);`
    );

    await executeSql(
      db,
      `CREATE INDEX idx_recipes_title ON recipes (title);`
    );

    console.log('Migration v1 completed successfully');
  }
};