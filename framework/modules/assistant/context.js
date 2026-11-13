/* ==========================================================
   Falcon Assistant - query context and audit trail
   Records the environment and exact context used for an AI
   call so a backup can explain where a query came from.
   ========================================================== */

export const QUERY_HISTORY_KEY = "falcon:query-history";
export const QUERY_HISTORY_LIMIT = 25;

function iso(value = new Date()) {
    return value instanceof Date ? value.toISOString() : String(value);
}

export function buildEnvironment({
    locationLike = globalThis.location,
    navigatorLike = globalThis.navigator,
    screenLike = globalThis.screen,
    now = new Date()
} = {}) {
    const timezone = (() => {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        } catch {
            return "";
        }
    })();

    return {
        captured_at: iso(now),
        origin: locationLike?.origin || "",
        path: locationLike?.pathname || "",
        timezone,
        locale: navigatorLike?.language || "",
        languages: Array.isArray(navigatorLike?.languages) ? [...navigatorLike.languages] : [],
        platform: navigatorLike?.userAgentData?.platform || navigatorLike?.platform || "",
        user_agent: navigatorLike?.userAgent || "",
        online: typeof navigatorLike?.onLine === "boolean" ? navigatorLike.onLine : null,
        screen: screenLike ? `${screenLike.width || 0}x${screenLike.height || 0}` : ""
    };
}

export function buildQueryEnvelope({
    question,
    notes = "",
    includeNotes = false,
    sources = [],
    context = "",
    prompt = "",
    provider = "local",
    model = "",
    appVersion = "",
    schemaVersion = null,
    environment = null,
    now = new Date()
}) {
    const cleanQuestion = String(question ?? "").trim();
    if (!cleanQuestion) throw new Error("La consulta no tiene pregunta");

    return {
        id: `q_${now instanceof Date ? now.getTime() : Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        created_at: iso(now),
        app: {
            name: "Falcon OSINT Framework",
            version: String(appVersion || ""),
            schema_version: schemaVersion
        },
        provider: String(provider || "local"),
        model: String(model || ""),
        question: cleanQuestion,
        notes_included: Boolean(includeNotes),
        notes: includeNotes ? String(notes ?? "") : "",
        sources: sources.map(source => ({
            n: source.n,
            id: source.id,
            kind: source.kind,
            title: source.title,
            url: source.url || ""
        })),
        context: String(context || ""),
        prompt: String(prompt || ""),
        environment: environment || buildEnvironment({ now })
    };
}

function readHistory(storage) {
    if (!storage) return [];
    try {
        const parsed = JSON.parse(storage.getItem(QUERY_HISTORY_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function loadQueryHistory(storage = globalThis.localStorage) {
    return readHistory(storage);
}

/** Adds a query record and keeps the newest records first. Never stores API keys. */
export function recordQuery(envelope, {
    storage = globalThis.localStorage,
    answer = "",
    limit = QUERY_HISTORY_LIMIT
} = {}) {
    if (!storage) return [];
    const record = {
        ...envelope,
        answer: String(answer || "")
    };
    const history = [record, ...readHistory(storage)].slice(0, Math.max(1, limit));
    try {
        storage.setItem(QUERY_HISTORY_KEY, JSON.stringify(history));
    } catch {
        // A full quota should not break the assistant response.
    }
    return history;
}

export function clearQueryHistory(storage = globalThis.localStorage) {
    if (!storage) return;
    storage.removeItem(QUERY_HISTORY_KEY);
}

export function queryHistorySize(history) {
    return JSON.stringify(history).length;
}
