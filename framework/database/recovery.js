/* ==========================================================
   Falcon Database Recovery
   Clasifica fallos de descarga/apertura/migración de SQLite y
   ofrece una salida recuperable. Ninguna acción borra datos
   del analista: sólo caché y service worker.
   ========================================================== */

const CORRUPT_PATTERN = /not a database|malformed|sqlite_notadb|file is encrypted/i;
const MIGRATION_PATTERN = /no se pudo migrar falcon\.db/i;
const DOWNLOAD_PATTERN = /no se pudo descargar falcon\.db|failed to fetch|networkerror|load failed|importing a module script failed/i;

const FAILURES = {
    corrupt: {
        title: "La base local está dañada",
        summary: "Falcon no pudo abrir falcon.db. Tu workspace guardado en este navegador sigue intacto.",
        hint: "Limpiá la caché de la app para volver a descargar el catálogo. Si el error continúa, descargá un backup desde Ajustes en otra copia de Falcon y reportá el fallo."
    },
    migration: {
        title: "No se pudo actualizar el esquema",
        summary: "La base se abrió, pero la migración falló y Falcon cerró la conexión para no dejar datos a medias.",
        hint: "Limpiá la caché para volver a descargar el catálogo empaquetado. Si persiste, el backup local es la vía de recuperación."
    },
    download: {
        title: "No se pudo cargar el catálogo",
        summary: "Falcon no recibió falcon.db completo. El shell y tus datos locales no se tocaron.",
        hint: "Revisá la conexión y reintentá. Si el service worker quedó con una copia vieja, limpiá la caché de la app."
    },
    unknown: {
        title: "Falcon no pudo iniciar la base",
        summary: "Ocurrió un error inesperado al abrir SQLite.",
        hint: "Reintentá; si el error se repite, limpiá la caché de la app y reportá el detalle."
    }
};

export function classifyDatabaseFailure(error) {
    const detail = String(error?.message ?? error ?? "").trim();
    const kind = CORRUPT_PATTERN.test(detail)
        ? "corrupt"
        : MIGRATION_PATTERN.test(detail)
            ? "migration"
            : DOWNLOAD_PATTERN.test(detail)
                ? "download"
                : "unknown";
    const failure = FAILURES[kind];

    return {
        kind,
        title: failure.title,
        summary: failure.summary,
        hint: failure.hint,
        detail: detail || "Sin detalle del motor SQLite.",
        actions: ["retry", "clear-cache"]
    };
}

/** Deletes Cache Storage entries and service worker registrations, never user data. */
export async function clearAppCaches(scope = globalThis) {
    const result = { cachesDeleted: 0, registrationsRemoved: 0, errors: [] };
    const cacheStorage = scope.caches;

    if (cacheStorage?.keys && cacheStorage?.delete) {
        try {
            for (const name of await cacheStorage.keys()) {
                if (await cacheStorage.delete(name)) result.cachesDeleted++;
            }
        } catch (error) {
            result.errors.push(String(error?.message ?? error));
        }
    }

    const serviceWorker = scope.navigator?.serviceWorker;

    if (serviceWorker?.getRegistrations) {
        try {
            for (const registration of await serviceWorker.getRegistrations()) {
                if (await registration.unregister()) result.registrationsRemoved++;
            }
        } catch (error) {
            result.errors.push(String(error?.message ?? error));
        }
    }

    return result;
}

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

export function renderDatabaseFailure(container, error, {
    onRetry = () => globalThis.location?.reload(),
    onClearCache = async () => {
        await clearAppCaches();
        globalThis.location?.reload();
    },
    confirm = message => globalThis.confirm?.(message) ?? false
} = {}) {
    if (!container) return null;

    const existing = container.querySelector("[data-database-error]");
    if (existing) return existing;

    const info = classifyDatabaseFailure(error);
    const section = document.createElement("section");
    section.className = "database-error";
    section.dataset.databaseError = info.kind;
    section.setAttribute("role", "alert");
    section.setAttribute("aria-labelledby", "database-error-title");

    section.innerHTML = `
        <h2 id="database-error-title">${esc(info.title)}</h2>
        <p>${esc(info.summary)}</p>
        <p class="database-error-hint">${esc(info.hint)}</p>
        <div class="database-error-actions">
            <button type="button" class="database-error-primary" data-database-retry>Reintentar</button>
            <button type="button" data-database-clear-cache>Limpiar caché de la app</button>
        </div>
        <p class="database-error-note">Limpiar la caché no borra favoritos, notas, IOC, colecciones ni ajustes.</p>
        <p class="database-error-status" role="status" aria-live="polite"></p>
        <details class="database-error-detail">
            <summary>Detalle técnico</summary>
            <pre>${esc(`${info.kind}: ${info.detail}`)}</pre>
        </details>
    `;

    const status = section.querySelector(".database-error-status");

    section.querySelector("[data-database-retry]").addEventListener("click", () => onRetry());

    section.querySelector("[data-database-clear-cache]").addEventListener("click", async event => {
        const button = event.currentTarget;
        if (!confirm("Se borrará la caché offline y se recargará Falcon. Tus datos locales se conservan. ¿Continuar?")) {
            return;
        }
        button.disabled = true;
        if (status) status.textContent = "Limpiando la caché…";
        try {
            await onClearCache();
        } catch (clearError) {
            button.disabled = false;
            if (status) status.textContent = `No se pudo limpiar la caché: ${clearError.message}`;
        }
    });

    container.prepend(section);
    section.querySelector("[data-database-retry]").focus({ preventScroll: true });

    return section;
}
