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

async function countToolFlag(column) {
    const rows = await Database.query(`
        SELECT COUNT(*) AS total
        FROM tools
        WHERE ${column} = 1;
    `);

    return firstValue(rows, "total", 0);
}

export async function loadDashboardStats() {
    const [
        totalTools,
        totalCategories,
        totalCountries,
        schemaVersion,
        offline,
        api,
        docker
    ] = await Promise.all([
        countTable("tools"),

        // The reference tables can exist but be empty in the compiled database;
        // a zero count used to win over the real values derived from tools.
        countTable("categories")
            .catch(() => 0)
            .then(total => total || countDistinctToolColumn("category")),

        countTable("countries")
            .catch(() => 0)
            .then(total => total || countDistinctToolColumn("country")),

        Database.query(`
            SELECT version
            FROM schema_version
            ORDER BY version DESC
            LIMIT 1;
        `).catch(() => []),

        countToolFlag("offline"),
        countToolFlag("api"),
        countToolFlag("docker")
    ]);

    return {
        totalTools,
        totalCategories,
        totalCountries,
        offline,
        api,
        docker,
        databaseVersion: firstValue(schemaVersion, "version", "Unknown")
    };
}
