/**
 * Falcon OSINT Framework
 * Database Schema Definition
 */

export const CURRENT_SCHEMA_VERSION = 1;

export const TABLES = [
  "tools",
  "categories",
  "countries",
  "licenses",
  "tags",
  "feeds",
  "relationships",
  "collections",
  "bookmarks",
  "schema_version",
  "migration_history"
];

export const INDEXES = [
  "idx_tools_category",
  "idx_tools_country",
  "idx_tools_status",
  "idx_tools_quality",
  "idx_tools_opsec",
  "tools_fts"
];

export const DATABASE_INFO = {
  name: "falcon.db",
  version: CURRENT_SCHEMA_VERSION,
  description: "Offline SQLite database for Falcon OSINT Framework"
};