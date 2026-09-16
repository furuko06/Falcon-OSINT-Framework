/**
 * Migration Engine
 */

import { CURRENT_SCHEMA_VERSION } from "./schema.js";

export const migrations = [

  {
    version: 1,
    name: "initial_schema",
    file: "001_initial.sql"
  }

];

export async function runMigrations(database) {

  database.execute(`
    CREATE TABLE IF NOT EXISTS schema_version(
      version INTEGER
    );
  `);

  const result = database.query(
    "SELECT version FROM schema_version LIMIT 1"
  );

  const installedVersion = result.length
    ? result[0].version
    : 0;

  if (installedVersion >= CURRENT_SCHEMA_VERSION)
    return;

  database.execute("DELETE FROM schema_version");

  database.execute(
    `INSERT INTO schema_version(version)
     VALUES(${CURRENT_SCHEMA_VERSION})`
  );

  console.info(`Migration ${CURRENT_SCHEMA_VERSION} applied.`);

}