import { describe, it, expect } from "vitest";
import path from "node:path";
import initSqlJs from "sql.js";
import { CURRENT_SCHEMA_VERSION } from "../framework/database/schema.js";
import { getSchemaInfo, runMigrations } from "../framework/database/migrations.js";

async function makeDb(withCatalog = false) {
    const SQL = await initSqlJs({ locateFile: file => path.resolve("node_modules/sql.js/dist", file) });
    const db = new SQL.Database();
    if (withCatalog) {
        db.run("CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL);");
        db.run("INSERT INTO tools(name) VALUES('Falcon');");
        db.run("CREATE TABLE schema_version (version INTEGER);");
        db.run("CREATE TABLE migration_history (version INTEGER, name TEXT, applied_at TEXT);");
    }
    return db;
}

function scalar(db, sql) {
    return db.exec(sql)[0]?.values[0]?.[0];
}

describe("database migrations", () => {
    it("upgrades a fresh database to the current schema and records history", async () => {
        const db = await makeDb();
        const result = runMigrations(db, { now: () => "2026-11-13T00:00:00.000Z" });

        expect(result).toMatchObject({ from: 0, to: CURRENT_SCHEMA_VERSION });
        expect(result.applied.map(item => item.version)).toEqual([1, 2]);
        expect(scalar(db, "SELECT version FROM schema_version")).toBe(CURRENT_SCHEMA_VERSION);
        expect(scalar(db, "SELECT COUNT(*) FROM sqlite_master WHERE name = 'app_meta'")).toBe(1);
        expect(scalar(db, "SELECT COUNT(*) FROM migration_history")).toBe(2);
    });

    it("repairs a legacy catalog whose schema_version is empty", async () => {
        const db = await makeDb(true);
        expect(scalar(db, "SELECT COUNT(*) FROM schema_version")).toBe(0);

        const result = runMigrations(db, { now: () => "2026-11-13T00:00:00.000Z" });

        expect(result).toMatchObject({ from: 0, to: CURRENT_SCHEMA_VERSION });
        expect(result.applied.map(item => item.name)).toEqual(["app_meta"]);
        expect(scalar(db, "SELECT version FROM schema_version")).toBe(CURRENT_SCHEMA_VERSION);
        expect(scalar(db, "SELECT name FROM migration_history WHERE version = 1")).toBe("legacy_baseline");
    });

    it("is idempotent after the first upgrade", async () => {
        const db = await makeDb(true);
        runMigrations(db);
        const second = runMigrations(db);

        expect(second.applied).toEqual([]);
        expect(second.from).toBe(CURRENT_SCHEMA_VERSION);
        expect(scalar(db, "SELECT COUNT(*) FROM schema_version")).toBe(1);
        expect(scalar(db, "SELECT COUNT(*) FROM migration_history")).toBe(2);
    });

    it("rejects databases from a newer schema instead of guessing", async () => {
        const db = await makeDb();
        db.run("CREATE TABLE schema_version (version INTEGER);");
        db.run(`INSERT INTO schema_version(version) VALUES(${CURRENT_SCHEMA_VERSION + 1});`);

        expect(() => runMigrations(db)).toThrow(/sólo entiende hasta/);
    });

    it("reports the installed version and migration names", async () => {
        const db = await makeDb();
        runMigrations(db, { now: () => "2026-11-13T00:00:00.000Z" });
        const info = getSchemaInfo(db);

        expect(info.version).toBe(CURRENT_SCHEMA_VERSION);
        expect(info.current).toBe(CURRENT_SCHEMA_VERSION);
        expect(info.migrations.map(item => item.name)).toEqual(["baseline_metadata", "app_meta"]);
    });
});
