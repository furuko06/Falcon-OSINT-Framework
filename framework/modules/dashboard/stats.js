import { Database } from "../../database/database.js";

function firstValue(rows, key, fallback = null) {
    return rows[0]?.[key] ?? fallback;
}

async function countTable(table) {
    const rows = await Database.query(`
        SELECT COUNT(*) AS total
        FROM ${table};
    `);

    return firstValue(rows, "total", 0);
}

async function countDistinctToolColumn(column) {
    const rows = await Database.query(`
        SELECT COUNT(DISTINCT NULLIF(${column}, '')) AS total
        FROM tools;
    `);

    return firstValue(rows, "total", 0);
}

export async function loadDashboardStats() {
    const [
        totalTools,
        totalCategories,
        totalCountries,
        schemaVersion
    ] = await Promise.all([
        countTable("tools"),

        countTable("categories").catch(() =>
            countDistinctToolColumn("category")
        ),

        countTable("countries").catch(() =>
            countDistinctToolColumn("country")
        ),

        Database.query(`
            SELECT version
            FROM schema_version
            ORDER BY version DESC
            LIMIT 1;
        `).catch(() => [])
    ]);

    return {
        totalTools,
        totalCategories,
        totalCountries,
        databaseVersion: firstValue(schemaVersion, "version", "Unknown")
    };
}
