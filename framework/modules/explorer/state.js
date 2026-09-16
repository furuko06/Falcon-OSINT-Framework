/**
 * Falcon Explorer State Store
 * M3.1.2
 */

import { loadFavorites } from "./favorites.js";

const listeners = new Set();
const initialFavorites = loadFavorites();

const DEFAULT_FILTERS = {
    category: null,
    country: null,
    offline: false,
    docker: false,
    api: false,
    favorites: false
};

export const ExplorerState = {
    initialized: false,

    theme: "dark",

    query: "",

    filters: {
        ...DEFAULT_FILTERS
    },

    categories: [],

    countries: [],

    tools: [],

    results: [],

    favorites: new Set(initialFavorites),

    stats: {
        tools: 0,
        categories: 0,
        countries: 0,
        favorites: initialFavorites.length
    }
};

export function subscribe(callback) {
    listeners.add(callback);

    return () => {
        listeners.delete(callback);
    };
}

export function notify() {
    listeners.forEach(listener => listener(ExplorerState));
}

export function updateState(patch) {
    if (patch.stats) {
        patch.stats = {
            ...ExplorerState.stats,
            ...patch.stats,
            favorites: ExplorerState.favorites.size
        };
    }

    Object.assign(ExplorerState, patch);
    notify();
}

export function updateFilters(patch) {
    ExplorerState.filters = {
        ...ExplorerState.filters,
        ...patch
    };

    notify();
}

export function resetFilters() {
    ExplorerState.filters = {
        ...DEFAULT_FILTERS
    };

    ExplorerState.results = [...ExplorerState.tools];

    notify();
}

export function setTheme(theme) {
    ExplorerState.theme = theme;
    notify();
}

export function setFavorites(favorites) {
    ExplorerState.favorites = new Set(
        [...favorites].map(id => String(id))
    );

    ExplorerState.stats = {
        ...ExplorerState.stats,
        favorites: ExplorerState.favorites.size
    };

    notify();
}
