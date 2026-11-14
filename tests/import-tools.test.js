import { describe, it, expect } from "vitest";
import path from "node:path";
import initSqlJs from "sql.js";
import { importTools, validateTools } from "../intelligence/build/import-tools.mjs";

const SCHEMA = `CREATE TABLE tools (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    description TEXT,
    country TEXT,
    website TEXT,
    github TEXT,
    license TEXT,
    status TEXT DEFAULT 'verified',
    offline INTEGER DEFAULT 0,
    api INTEGER DEFAULT 0,
    docker INTEGER DEFAULT 0,
    vpn_friendly INTEGER DEFAULT 0,
    tor_friendly INTEGER DEFAULT 0,
    opsec_score INTEGER DEFAULT 0,
    quality_score INTEGER DEFAULT 0,
    last_verified TEXT
)`;

async function makeDb() {
    const SQL = await initSqlJs({ locateFile: file => path.resolve("node_modules/sql.js/dist", file) });
    const db = new SQL.Database();
    db.run(SCHEMA);
    return db;
}

function rows(db) {
    return db.exec("SELECT name, description, offline FROM tools ORDER BY name")[0].values;
}

describe("tool importer", () => {
    it("inserts new tools, updates changed fields and skips unchanged ones", async () => {
        const db = await makeDb();
        const tool = { name: "Sample", category: "HUMINT", description: "Texto en inglés.", country: "GLOBAL", offline: true, quality_score: 80 };

        expect(importTools(db, [tool])).toEqual({ inserted: 1, updated: 0, skipped: 0, removed: 0 });
        expect(rows(db)).toEqual([["Sample", "Texto en inglés.", 1]]);

        expect(importTools(db, [tool])).toEqual({ inserted: 0, updated: 0, skipped: 1, removed: 0 });

        expect(importTools(db, [{ ...tool, description: "Texto en español." }])).toEqual({ inserted: 0, updated: 1, skipped: 0, removed: 0 });
        expect(rows(db)).toEqual([["Sample", "Texto en español.", 1]]);
        expect(db.exec("SELECT COUNT(*) FROM tools")[0].values[0][0]).toBe(1);
    });

    it("does not duplicate tools that differ only in name casing", async () => {
        const db = await makeDb();
        importTools(db, [{ name: "CaseTest", description: "Uno." }]);
        expect(importTools(db, [{ name: "casetest", description: "Dos." }])).toEqual({ inserted: 0, updated: 1, skipped: 0, removed: 0 });
        expect(db.exec("SELECT COUNT(*) FROM tools")[0].values[0][0]).toBe(1);
    });

    it("refuses a batch with an unnamed entry without writing any row", async () => {
        const db = await makeDb();
        const batch = [
            { name: "Valid", description: "Primera." },
            { description: "Sin nombre." }
        ];

        expect(() => importTools(db, batch)).toThrow(/Import cancelado: 1 entrada/);
        expect(db.exec("SELECT COUNT(*) FROM tools")[0].values[0][0]).toBe(0);
        expect(() => importTools(db, batch)).toThrow(/falta "name"/);
    });

    it("refuses duplicate names inside one batch instead of dropping the second", () => {
        const problems = validateTools([
            { name: "Amass", website: "https://example.org" },
            { name: "amass", website: "https://example.org" }
        ]);

        expect(problems).toHaveLength(1);
        expect(problems[0]).toMatch(/repite la entrada 1/);
    });

    it("refuses a non-http website and an unknown status", async () => {
        const db = await makeDb();
        const batch = [
            { name: "Evil", website: "javascript:alert(1)" },
            { name: "Odd", status: "probablemente-ok" }
        ];

        const problems = validateTools(batch);
        expect(problems.some(problem => problem.includes('"website" no es una URL http(s)'))).toBe(true);
        expect(problems.some(problem => problem.includes('estado desconocido "probablemente-ok"'))).toBe(true);
        expect(() => importTools(db, batch)).toThrow(/Import cancelado: 2 entrada/);
        expect(db.exec("SELECT COUNT(*) FROM tools")[0].values[0][0]).toBe(0);
    });

    it("is idempotent: a second run changes nothing and leaves the same bytes", async () => {
        const db = await makeDb();
        const batch = [
            { name: "Alpha", description: "Primera.", offline: true },
            { name: "Beta", description: "Segunda.", quality_score: 70 }
        ];

        importTools(db, batch);
        const firstExport = Buffer.from(db.export());

        expect(importTools(db, batch)).toEqual({ inserted: 0, updated: 0, skipped: 2, removed: 0 });
        expect(Buffer.from(db.export()).equals(firstExport)).toBe(true);
    });

    it("removes tools deleted from the catalog and does not remove them twice", async () => {
        const db = await makeDb();
        importTools(db, [
            { name: "Alpha", description: "Primera." },
            { name: "Beta", description: "Segunda." }
        ]);

        expect(importTools(db, [{ name: "Beta", description: "Segunda." }])).toEqual({
            inserted: 0, updated: 0, skipped: 1, removed: 1
        });
        expect(rows(db).map(row => row[0])).toEqual(["Beta"]);

        expect(importTools(db, [{ name: "Beta", description: "Segunda." }])).toEqual({
            inserted: 0, updated: 0, skipped: 1, removed: 0
        });
    });

    it("refuses an empty catalog instead of wiping the table", async () => {
        const db = await makeDb();
        importTools(db, [{ name: "Keep", description: "No se borra." }]);

        expect(() => importTools(db, [])).toThrow(/catálogo está vacío/);
        expect(rows(db).map(row => row[0])).toEqual(["Keep"]);
    });
});
