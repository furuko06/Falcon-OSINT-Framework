import { ExplorerState, updateState, updateFilters, resetFilters } from "./state.js";

function matchesTool(tool, filters, query, favorites) {
    const text = query.trim().toLowerCase();
    
    // Búsqueda de texto
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
    
    // Multi-filtro de categorías
    if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(tool.category)) {
            return false;
        }
    }
    
    // Multi-filtro de países
    if (filters.countries && filters.countries.length > 0) {
        if (!filters.countries.includes(tool.country)) {
            return false;
        }
    }
    
    // Multi-filtro de licencias
    if (filters.licenses && filters.licenses.length > 0) {
        if (!filters.licenses.includes(tool.license)) {
            return false;
        }
    }
    
    // Multi-filtro de health
    if (filters.health && filters.health.length > 0) {
        if (!filters.health.includes(tool.status)) {
            return false;
        }
    }
    
    // Filtros booleanos
    if (filters.offline && Number(tool.offline) !== 1) {
        return false;
    }
    if (filters.docker && Number(tool.docker) !== 1) {
        return false;
    }
    if (filters.api && Number(tool.api) !== 1) {
        return false;
    }
    if (filters.vpn && Number(tool.vpn_friendly) !== 1) {
        return false;
    }
    if (filters.tor && Number(tool.tor_friendly) !== 1) {
        return false;
    }
    if (filters.favorites && !favorites.has(String(tool.id))) {
        return false;
    }
    
    return true;
}

function sortTools(tools, sortBy) {
    const sorted = [...tools];
    
    switch (sortBy) {
        case "name":
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        
        case "quality":
            return sorted.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
        
        case "opsec":
            return sorted.sort((a, b) => (b.opsec_score || 0) - (a.opsec_score || 0));
        
        case "country":
            return sorted.sort((a, b) => (a.country || "").localeCompare(b.country || ""));
        
        default:
            return sorted;
    }
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
    
    const sorted = sortTools(results, ExplorerState.sort);
    updateState({ results: sorted });
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
    
    const sorted = sortTools(results, ExplorerState.sort);
    updateState({ results: sorted });
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
    
    const sorted = sortTools(results, ExplorerState.sort);
    updateState({
        query: "",
        results: sorted
    });
}