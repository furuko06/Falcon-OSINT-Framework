import { Database } from "../../database/database.js";
import { updateState } from "./state.js";
import { applyCurrentFilters } from "./filters.js";

export async function loadTools() {
    globalThis.performance?.mark?.("falcon:tools-query-start");
    const tools = await Database.query(`
        SELECT * FROM tools ORDER BY quality_score DESC;
    `);
    if (globalThis.performance?.mark && globalThis.performance?.measure) {
        performance.mark("falcon:tools-query-end");
        try {
            performance.measure("falcon:tools-query", "falcon:tools-query-start", "falcon:tools-query-end");
        } catch {
            // Metrics are diagnostic only.
        }
    }
    window.__falconTools = tools;

    updateState({
        tools,
        results: tools,
        stats: {
            tools: tools.length,
            categories: new Set(tools.map(t => t.category).filter(Boolean)).size,
            countries: new Set(tools.map(t => t.country).filter(Boolean)).size,
            offline: tools.filter(t => Number(t.offline) === 1).length
        }
    });
    return tools;
}

export function search(query = "") {
    updateState({ query });
    applyCurrentFilters();
}