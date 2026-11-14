/**
 * Falcon Migration Engine
 *
 * Forward-only migrations for browser and Node. The engine also repairs
 * databases created before metadata rows were written: if the catalog exists
 * but schema_version is empty, it records the baseline and then upgrades.
 */

import { CURRENT_SCHEMA_VERSION } from "./schema.js";

const METADATA_TABLES = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER
  );

  CREATE TABLE IF NOT EXISTS migration_history (
    version INTEGER,
    name TEXT,
    applied_at TEXT
  );
`;

export const migrations = [
  {
    version: 1,
    name: "baseline_metadata",
    up(database) {
      // Legacy databases already contain the catalog; this migration only
      // guarantees the metadata tables exist and is recorded on repair.
      execute(database, METADATA_TABLES);
    }
  },
  {
    version: 2,
    name: "app_meta",
    up(database) {
      execute(database, `
        CREATE TABLE IF NOT EXISTS app_meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
    }
  }
];

function execute(database, sql) {
  if (typeof database.execute === "function") {
    database.execute(sql);
  } else {
    database.run(sql);
  }
}

function rows(database, sql) {
  if (typeof database.query === "function") return database.query(sql);

  const result = database.exec(sql)[0];
  if (!result) return [];
  return result.values.map(values =>
    Object.fromEntries(result.columns.map((column, index) => [column, values[index]]))
  );
}

function tableExists(database, table) {
  return rows(
    database,
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${table}' LIMIT 1;`
  ).length > 0;
}

function readInstalledVersion(database) {
  const result = rows(database, "SELECT MAX(version) AS version FROM schema_version;");
  const version = Number(result[0]?.version);
  return Number.isFinite(version) ? version : 0;
}

function writeInstalledVersion(database, version) {
  execute(database, "DELETE FROM schema_version;");
  execute(database, `INSERT INTO schema_version(version) VALUES(${Number(version)});`);
}

function historyVersions(database) {
  return new Set(
    rows(database, "SELECT version FROM migration_history;")
      .map(row => Number(row.version))
      .filter(Number.isFinite)
  );
}

function recordMigration(database, version, name, appliedAt) {
  execute(database, `DELETE FROM migration_history WHERE version = ${Number(version)};`);
  execute(
    database,
    `INSERT INTO migration_history(version, name, applied_at)
     VALUES(${Number(version)}, '${String(name).replace(/'/g, "''")}', '${String(appliedAt).replace(/'/g, "''")}');`
  );
}

/**
 * Applies every migration newer than the installed version.
 * Returns { from, to, applied } so callers can log or test the upgrade.
 */
export function runMigrations(database, { now = () => new Date().toISOString() } = {}) {
  execute(database, METADATA_TABLES);

  const from = readInstalledVersion(database);
  let current = from;

  if (current > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `La base usa el esquema ${current}, pero esta versión de Falcon sólo entiende hasta ${CURRENT_SCHEMA_VERSION}.`
    );
  }

  // A database compiled before metadata rows existed has the catalog but no
  // version. Treat it as v1 instead of skipping the upgrade path.
  if (current === 0 && tableExists(database, "tools")) {
    current = 1;
    writeInstalledVersion(database, current);
    recordMigration(database, 1, "legacy_baseline", now());
  }

  const applied = [];
  for (const migration of migrations) {
    if (migration.version <= current) continue;
    migration.up(database);
    current = migration.version;
    writeInstalledVersion(database, current);
    recordMigration(database, migration.version, migration.name, now());
    applied.push({ version: migration.version, name: migration.name });
  }

  if (current === 0) {
    // Fresh, empty database: the baseline migration has nothing to create,
    // but the version must still be recorded so later upgrades are ordered.
    writeInstalledVersion(database, 0);
  }

  // Backfill names for metadata rows written by older builds.
  const known = new Map(migrations.map(migration => [migration.version, migration.name]));
  const recorded = historyVersions(database);
  for (let version = 1; version <= current; version++) {
    if (!recorded.has(version)) {
      recordMigration(database, version, known.get(version) || "unknown", now());
    }
  }

  return { from, to: current, applied };
}

export function getSchemaInfo(database) {
  const version = readInstalledVersion(database);
  return {
    version,
    current: CURRENT_SCHEMA_VERSION,
    migrations: rows(
      database,
      "SELECT version, name, applied_at FROM migration_history ORDER BY version ASC;"
    )
  };
}
