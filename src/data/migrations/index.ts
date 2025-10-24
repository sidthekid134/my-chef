import { Migration } from '../db/Database';
import { migration_v1 } from './Migration_v1';

/**
 * Register all migrations here in order of version
 * When adding a new migration, create a new migration file and register it here
 */
const migrations: Migration[] = [
  migration_v1,
  // Add future migrations here
];

export default migrations;