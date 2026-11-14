import fs from "node:fs";
import initSqlJs from "sql.js";

const SQL = await initSqlJs();

const bytes = fs.readFileSync("database/falcon.db");
const db = new SQL.Database(bytes);

console.log("\n=== TABLAS ===");

const tables = db.exec(`
SELECT name
FROM sqlite_master
WHERE type='table';
`);

console.log(tables[0]?.values ?? []);

console.log("\n=== CANTIDAD DE TOOLS ===");

try {
    const tools = db.exec("SELECT COUNT(*) FROM tools;");
    console.log(tools[0].values);
} catch (e) {
    console.error(e.message);
}

console.log("\n=== ESQUEMA ===");

const schema = db.exec(`
SELECT name, sql
FROM sqlite_master
WHERE type='table';
`);

console.log(schema[0]?.values ?? []);