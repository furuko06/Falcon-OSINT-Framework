import { ExplorerState, updateState, updateFilters, resetFilters } from "./state.js";

export function normalizeStatus(status) {
    return String(status || "").toLowerCase();
}

function matchesTool(tool, filters, query, favorites) {
    const text = query.trim().toLowerCase();

    if (text) {
        const haystack = [
            tool.name, tool.category, tool.subcategory,
            tool.description, tool.country
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(text)) return false;
    }

    if (filters.categories.length && !filters.categories.includes(tool.category)) return false;
    if (filters.countries.length && !filters.countries.includes(tool.country)) return false;
    if (filters.licenses.length && !filters.licenses.includes(tool.license)) return false;
    if (filters.health.length && !filters.health.includes(normalizeStatus(tool.status))) return false;

    if (filters.offline && Number(tool.offline) !== 1) return false;
    if (filters.docker && Number(tool.docker) !== 1) return false;
    if (filters.api && Number(tool.api) !== 1) return false;
    if (filters.vpn && Number(tool.vpn_friendly) !== 1) return false;
    if (filters.tor && Number(tool.tor_friendly) !== 1) return false;
    if (filters.favorites && !favorites.has(String(tool.id))) return false;

    return true;
}

function sortTools(tools, sortBy) {
    const sorted = [...tools];
    switch (sortBy) {
        case "quality": return sorted.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
        case "opsec":   return sorted.sort((a, b) => (b.opsec_score || 0) - (a.opsec_score || 0));
        case "country": return sorted.sort((a, b) => (a.country || "").localeCompare(b.country || ""));
        default:        return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
}

function compute() {
    const results = ExplorerState.tools.filter(tool =>
        matchesTool(tool, ExplorerState.filters, ExplorerState.query, ExplorerState.favorites)
    );
    updateState({ results: sortTools(results, ExplorerState.sort) });
}

export function applyFilters(patch = {}) {
    updateFilters(patch);
    compute();
}

export function applyCurrentFilters() {
    compute();
}

export function clearFilters() {
    resetFilters();
    updateState({ query: "" });
    compute();
}