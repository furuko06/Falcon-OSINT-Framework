import {
    Database
} from "../../database/database.js";

import {
    ExplorerState,
    updateState
} from "./state.js";

import {
    applyCurrentFilters
} from "./filters.js";

export async function loadTools() {

    const tools = await Database.query(`
        SELECT *
        FROM tools
        ORDER BY quality_score DESC;
    `);

    window.__falconTools = tools;

    updateState({

        tools,

        results: tools,

        stats: {

            tools: tools.length,

            categories:
                new Set(
                    tools
                        .map(tool => tool.category)
                        .filter(Boolean)
                ).size,

            countries:
                new Set(
                    tools
                        .map(tool => tool.country)
                        .filter(Boolean)
                ).size

        }

    });

    return tools;
}

export function search(query = "") {

    updateState({
        query
    });

    applyCurrentFilters();
}