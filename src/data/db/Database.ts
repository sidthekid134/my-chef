import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

/**
 * Database configuration
 */
export const DB_CONFIG = {
  name: 'chef_recipes.db',
  version: 1,
  description: 'Chef Recipe App Database',
};

/**
 * Type for database migration function
 */
export type MigrationFunction = (db: SQLite.SQLiteDatabase) => Promise<void>;

/**
 * Interface for migration metadata
 */
export interface Migration {
  version: number;
  migrate: MigrationFunction;
}

let database: SQLite.SQLiteDatabase | null = null;

/**
 * Get a SQLite database instance
 * @returns SQLite database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (database === null) {
    database = openDatabase();
  }
  return database;
}

/**
 * Open the SQLite database
 * @returns Opened SQLite database
 */
function openDatabase(): SQLite.SQLiteDatabase {
  // Web compatibility fix for Expo (needed when running in web environment)
  if (Platform.OS === 'web') {
    return {
      exec: () => Promise.reject(new Error('Database not available on web platform')),
      transaction: () => ({ executeSql: () => {} }),
    } as unknown as SQLite.SQLiteDatabase;
  }

  return SQLite.openDatabase(DB_CONFIG.name);
}

/**
 * Initialize database: create schema version table and apply migrations
 * @param migrations Array of migration functions
 */
export async function initDatabase(migrations: Migration[]): Promise<void> {
  const db = getDatabase();

  // Create schema version table if it doesn't exist
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );`,
      [],
      () => {
        console.log('Schema version table initialized');
      },
      (_, error) => {
        console.error('Error creating schema version table:', error);
        return false;
      }
    );
  });

  // Check current schema version
  const currentVersion = await getCurrentSchemaVersion(db);
  console.log('Current schema version:', currentVersion);

  // Apply needed migrations
  await applyMigrations(db, migrations, currentVersion);
}

/**
 * Get the current schema version from the database
 * @param db SQLite database instance
 * @returns Current schema version number
 */
async function getCurrentSchemaVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT MAX(version) as version FROM schema_version;',
        [],
        (_, resultSet) => {
          const version = resultSet.rows.length > 0
            ? (resultSet.rows.item(0).version ?? 0)
            : 0;
          resolve(version);
        },
        (_, error) => {
          console.error('Error getting schema version:', error);
          // If there's an error, assume version 0 to trigger all migrations
          resolve(0);
          return false;
        }
      );
    });
  });
}

/**
 * Apply needed migrations to the database
 * @param db SQLite database instance
 * @param migrations Array of migration functions
 * @param currentVersion Current schema version
 */
async function applyMigrations(
  db: SQLite.SQLiteDatabase,
  migrations: Migration[],
  currentVersion: number
): Promise<void> {
  try {
    // Sort migrations by version to ensure they're applied in order
    const sortedMigrations = [...migrations].sort((a, b) => a.version - b.version);

    // Apply only migrations with a version greater than the current version
    for (const migration of sortedMigrations) {
      if (migration.version > currentVersion) {
        console.log(`Applying migration to version ${migration.version}`);

        // Apply migration in a transaction
        await executeInTransaction(db, async () => {
          await migration.migrate(db);

          // Update schema version
          return new Promise<void>((resolve, reject) => {
            db.transaction(tx => {
              tx.executeSql(
                'INSERT INTO schema_version (version, applied_at) VALUES (?, datetime("now"));',
                [migration.version],
                () => {
                  console.log(`Migration to version ${migration.version} completed`);
                  resolve();
                },
                (_, error) => {
                  console.error(`Error updating schema version to ${migration.version}:`, error);
                  reject(error);
                  return false;
                }
              );
            });
          });
        });
      }
    }

    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    throw error;
  }
}

/**
 * Execute a function within a database transaction
 * @param db SQLite database instance
 * @param operation Function to execute within transaction
 * @returns Result of the operation
 */
export async function executeInTransaction<T>(
  db: SQLite.SQLiteDatabase,
  operation: () => Promise<T>
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    db.transaction(
      async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      error => reject(error),
      () => {}
    );
  });
}

/**
 * Execute SQL statement with parameters
 * @param db SQLite database instance
 * @param sql SQL statement
 * @param params SQL parameters
 * @returns SQLite result set
 */
export function executeSql(
  db: SQLite.SQLiteDatabase,
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLResultSet> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, resultSet) => resolve(resultSet),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}