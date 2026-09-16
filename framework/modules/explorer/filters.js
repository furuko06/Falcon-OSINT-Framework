import { ExplorerState, updateState, updateFilters, resetFilters } from "./state.js";

function matchesTool(tool, filters, query, favorites) {

    const text = query.trim().toLowerCase();

    if (text) {
        const haystack = [
            tool.name,
            tool.category,
            tool.subcategory,
            tool.description,
            tool.country
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        if (!haystack.includes(text)) {
            return false;
        }
    }

    if (filters.category && tool.category !== filters.category) {
        return false;
    }

    if (filters.country && tool.country !== filters.country) {
        return false;
    }

    if (filters.offline && Number(tool.offline) !== 1) {
        return false;
    }

    if (filters.docker && Number(tool.docker) !== 1) {
        return false;
    }

    if (filters.api && Number(tool.api) !== 1) {
        return false;
    }

    if (filters.favorites && !favorites.has(String(tool.id))) {
        return false;
    }

    return true;
}

export function applyFilters(patch = {}) {

    updateFilters(patch);

    const results = ExplorerState.tools.filter(tool =>
        matchesTool(
            tool,
            ExplorerState.filters,
            ExplorerState.query,
            ExplorerState.favorites
        )
    );

    updateState({ results });
}

export function applyCurrentFilters() {

    const results = ExplorerState.tools.filter(tool =>
        matchesTool(
            tool,
            ExplorerState.filters,
            ExplorerState.query,
            ExplorerState.favorites
        )
    );

    updateState({ results });
}

export function clearFilters() {

    resetFilters();

    const results = ExplorerState.tools.filter(tool =>
        matchesTool(
            tool,
            ExplorerState.filters,
            "",
            ExplorerState.favorites
        )
    );

    updateState({
        query: "",
        results
    });
}
