/* ==========================================================
   Falcon local backup
   Produces a portable JSON file with the catalog snapshot,
   local settings and the AI query trail (environment,
   exact prompt and sources). API keys are never included.
   ========================================================== */

import {
    QUERY_HISTORY_KEY,
    buildEnvironment,
    loadQueryHistory
} from "../assistant/context.js";

export const BACKUP_FORMAT = "falcon-backup";
export const BACKUP_FORMAT_VERSION = 1;

const SENSITIVE_KEY = /openrouter|authorization|api[-_]?key|token|secret|password/i;

export function isSensitiveKey(key) {
    return SENSITIVE_KEY.test(String(key || ""));
}

function normalizeBytes(value) {
    if (!value) return null;
    if (value instanceof Uint8Array) return value;
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    return null;
}

function bytesToBase64(bytes) {
    let binary = "";
    const chunk = 0x8000;
    for (let index = 0; index < bytes.length; index += chunk) {
        binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
    }
    return btoa(binary);
}

export async function sha256Hex(value, cryptoImpl = globalThis.crypto) {
    if (!cryptoImpl?.subtle) throw new Error("Web Crypto no está disponible para calcular el checksum");
    const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(String(value));
    const digest = await cryptoImpl.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function collectLocalData(storage, { exclude = [QUERY_HISTORY_KEY] } = {}) {
    if (!storage) return {};
    const blocked = new Set(exclude);
    const data = {};

    for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index);
        if (!key || !key.startsWith("falcon:")) continue;
        if (blocked.has(key) || isSensitiveKey(key)) continue;
        const value = storage.getItem(key);
        if (typeof value === "string") data[key] = value;
    }

    return data;
}

export function backupFilename(now = new Date()) {
    const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    return `falcon-backup-${stamp}.json`;
}

/**
 * Builds the backup object. `databaseBytes` is optional so tests and
 * environments without SQLite can still export local settings.
 */
export async function buildBackup({
    storage = globalThis.localStorage,
    databaseBytes = null,
    app = {},
    environment = null,
    history = null,
    now = new Date()
} = {}) {
    const bytes = normalizeBytes(databaseBytes);
    const queries = history || loadQueryHistory(storage);

    return {
        format: BACKUP_FORMAT,
        format_version: BACKUP_FORMAT_VERSION,
        created_at: now.toISOString(),
        app: {
            name: "Falcon OSINT Framework",
            version: String(app.version || ""),
            schema_version: app.schemaVersion ?? null
        },
        environment: environment || buildEnvironment({ now }),
        database: bytes ? {
            filename: "falcon.db",
            bytes: bytes.length,
            sha256: await sha256Hex(bytes),
            base64: bytesToBase64(bytes)
        } : null,
        local_data: collectLocalData(storage),
        queries,
        warnings: [
            "Las claves de OpenRouter y cualquier token no se incluyen en este backup.",
            "El archivo puede contener notas de caso y prompts: guardalo como evidencia sensible."
        ]
    };
}

export function parseBackup(input) {
    let parsed = input;
    if (typeof input === "string") {
        try {
            parsed = JSON.parse(input);
        } catch {
            throw new Error("El archivo no es un JSON válido.");
        }
    }

    if (!parsed || typeof parsed !== "object") throw new Error("El backup está vacío.");
    if (parsed.format !== BACKUP_FORMAT) throw new Error("El archivo no es un backup de Falcon.");
    if (Number(parsed.format_version) !== BACKUP_FORMAT_VERSION) {
        throw new Error(`Versión de backup no soportada: ${parsed.format_version}.`);
    }
    if (parsed.local_data !== undefined && (typeof parsed.local_data !== "object" || parsed.local_data === null)) {
        throw new Error("El backup tiene datos locales inválidos.");
    }
    if (parsed.queries !== undefined && !Array.isArray(parsed.queries)) {
        throw new Error("El historial de consultas del backup es inválido.");
    }

    return parsed;
}

/**
 * Merges a backup into localStorage. Database bytes are not replaced in the
 * browser; they are kept in the file for external recovery and inspection.
 */
export function restoreBackup(input, {
    storage = globalThis.localStorage,
    now = new Date()
} = {}) {
    const backup = parseBackup(input);
    if (!storage) throw new Error("No hay almacenamiento local disponible.");

    const restored = [];
    const skipped = [];

    for (const [key, value] of Object.entries(backup.local_data || {})) {
        if (typeof value !== "string" || !key.startsWith("falcon:") || isSensitiveKey(key)) {
            skipped.push(key);
            continue;
        }
        storage.setItem(key, value);
        restored.push(key);
    }

    if (Array.isArray(backup.queries)) {
        storage.setItem(QUERY_HISTORY_KEY, JSON.stringify(backup.queries));
        restored.push(QUERY_HISTORY_KEY);
    }

    storage.setItem("falcon:last-restore", JSON.stringify({
        restored_at: now.toISOString(),
        from: backup.created_at || "",
        keys: restored.length
    }));

    return { restored, skipped, backup };
}
