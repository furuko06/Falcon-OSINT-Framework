const STORAGE_KEY = "falcon:favorites";

function normalizeId(id) {
    return String(id);
}

function readStoredFavorites() {
    if (typeof localStorage === "undefined") {
        return [];
    }

    try {
        const value = localStorage.getItem(STORAGE_KEY);
        const parsed = value ? JSON.parse(value) : [];

        return Array.isArray(parsed)
            ? parsed.map(normalizeId)
            : [];
    } catch {
        return [];
    }
}

export function loadFavorites() {
    return readStoredFavorites();
}

export function saveFavorites(ids) {
    if (typeof localStorage === "undefined") {
        return;
    }

    const favorites = [...ids].map(normalizeId);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(favorites)
    );
}

export function toggleFavorite(
    toolId,
    currentFavorites
) {
    const id = normalizeId(toolId);
    const next = new Set(
        [...currentFavorites].map(normalizeId)
    );

    if (next.has(id)) {
        next.delete(id);
    } else {
        next.add(id);
    }

    saveFavorites(next);

    return next;
}
