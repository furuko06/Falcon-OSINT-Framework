import { Database } from "../../database/database.js";
import { ExplorerState, updateState } from "./state.js";

/**
 * Carga todas las herramientas desde falcon.db
 */
export async function loadTools() {

    console.log("🦅 Falcon: cargando SQLite...");

    const tools = await Database.query(`
        SELECT *
        FROM tools
        ORDER BY quality_score DESC;
    `);

    console.log(`🦅 Falcon: ${tools.length} herramientas cargadas.`);
    console.table(tools);

    updateState({
        tools,
        results: tools,
        stats: {
            tools: tools.length,
            categories: [...new Set(tools.map(t => t.category))].length
        }
    });

}

/**
 * Búsqueda temporal (FTS5 llegará en M3.3)
 */
export function search(query = "") {

    updateState({ query });

    const text = query.trim().toLowerCase();

    if (text === "") {
        updateState({
            results: ExplorerState.tools
        });
        return;
    }

    const results = ExplorerState.tools.filter(tool => {

        return (
            (tool.name || "").toLowerCase().includes(text) ||
            (tool.category || "").toLowerCase().includes(text) ||
            (tool.subcategory || "").toLowerCase().includes(text) ||
            (tool.description || "").toLowerCase().includes(text) ||
            (tool.country || "").toLowerCase().includes(text)
        );

    });

    updateState({ results });

}