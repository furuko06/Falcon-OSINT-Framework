/* ==========================================================
   OpenRouter OAuth PKCE connection
   Falcon never sees the user's OpenRouter password. The PKCE
   verifier lives in sessionStorage, the API key is kept in
   sessionStorage for this tab only, and every call needs an
   explicit consent flag from the caller.
   ========================================================== */

export const AUTH_URL = "https://openrouter.ai/auth";
export const API_BASE = "https://openrouter.ai/api/v1";
export const DEFAULT_MODEL = "openrouter/auto";
export const PENDING_KEY = "falcon:openrouter:pending";
export const SESSION_KEY = "falcon:openrouter:session";
export const AUTH_ERROR_KEY = "falcon:openrouter:auth-error";

let modelsCache = null;

function base64Url(bytes) {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomBytes(length, cryptoImpl) {
    if (!cryptoImpl?.getRandomValues) throw new Error("Web Crypto no está disponible para iniciar OAuth.");
    const bytes = new Uint8Array(length);
    cryptoImpl.getRandomValues(bytes);
    return bytes;
}

export function randomVerifier(cryptoImpl = globalThis.crypto) {
    return base64Url(randomBytes(32, cryptoImpl));
}

export async function codeChallenge(verifier, cryptoImpl = globalThis.crypto) {
    if (!cryptoImpl?.subtle) throw new Error("Web Crypto no está disponible para calcular el challenge.");
    const digest = await cryptoImpl.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    return base64Url(new Uint8Array(digest));
}

export function callbackUrl(locationLike = globalThis.location) {
    if (!locationLike?.origin) throw new Error("No se pudo determinar la URL de retorno.");
    return `${locationLike.origin}${locationLike.pathname || "/"}`;
}

export async function beginAuth({
    locationLike = globalThis.location,
    sessionStorage = globalThis.sessionStorage,
    cryptoImpl = globalThis.crypto,
    redirect = url => globalThis.location.assign(url),
    now = new Date()
} = {}) {
    if (!sessionStorage) throw new Error("No hay sessionStorage para guardar el verificador PKCE.");
    const verifier = randomVerifier(cryptoImpl);
    const challenge = await codeChallenge(verifier, cryptoImpl);
    const state = base64Url(randomBytes(16, cryptoImpl));
    const url = new URL(AUTH_URL);
    url.searchParams.set("callback_url", callbackUrl(locationLike));
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("state", state);
    url.searchParams.set("key_label", "Falcon OSINT Framework");

    sessionStorage.setItem(PENDING_KEY, JSON.stringify({
        verifier,
        state,
        callback_url: url.searchParams.get("callback_url"),
        created_at: now.toISOString()
    }));
    redirect(url.toString());
    return { url: url.toString(), state };
}

export function hasAuthCallback(search = globalThis.location?.search || "") {
    return Boolean(new URLSearchParams(search).get("code"));
}

export function loadPending(sessionStorage = globalThis.sessionStorage) {
    if (!sessionStorage) return null;
    try {
        const parsed = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null");
        return parsed && parsed.verifier ? parsed : null;
    } catch {
        return null;
    }
}

export function clearPending(sessionStorage = globalThis.sessionStorage) {
    sessionStorage?.removeItem(PENDING_KEY);
}

export function loadConnection(sessionStorage = globalThis.sessionStorage) {
    if (!sessionStorage) return null;
    try {
        const parsed = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
        if (!parsed || typeof parsed.key !== "string" || !parsed.key) return null;
        return {
            provider: "openrouter",
            key: parsed.key,
            model: typeof parsed.model === "string" && parsed.model ? parsed.model : DEFAULT_MODEL,
            connected_at: parsed.connected_at || "",
            label: parsed.label || "OpenRouter"
        };
    } catch {
        return null;
    }
}

export function saveConnection(connection, sessionStorage = globalThis.sessionStorage) {
    if (!sessionStorage) throw new Error("No hay sessionStorage para guardar la conexión.");
    const safe = {
        provider: "openrouter",
        key: String(connection.key || ""),
        model: String(connection.model || DEFAULT_MODEL),
        connected_at: connection.connected_at || new Date().toISOString(),
        label: connection.label || "OpenRouter"
    };
    if (!safe.key) throw new Error("La conexión no tiene una clave válida.");
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    return safe;
}

export function updateConnectionModel(model, sessionStorage = globalThis.sessionStorage) {
    const current = loadConnection(sessionStorage);
    if (!current) throw new Error("No hay una conexión de OpenRouter activa.");
    return saveConnection({ ...current, model }, sessionStorage);
}

export function disconnect(sessionStorage = globalThis.sessionStorage) {
    sessionStorage?.removeItem(SESSION_KEY);
    sessionStorage?.removeItem(PENDING_KEY);
}

export function maskKey(key) {
    const value = String(key || "");
    if (value.length <= 10) return "••••";
    return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function setAuthError(message, sessionStorage = globalThis.sessionStorage) {
    sessionStorage?.setItem(AUTH_ERROR_KEY, String(message || "No se pudo completar la conexión."));
}

/** Reads and clears the one-shot OAuth error left by a failed callback. */
export function takeAuthError(sessionStorage = globalThis.sessionStorage) {
    const message = sessionStorage?.getItem(AUTH_ERROR_KEY) || "";
    sessionStorage?.removeItem(AUTH_ERROR_KEY);
    return message;
}

async function errorDetail(response) {
    try {
        const data = await response.json();
        return data?.error?.message || data?.message || "";
    } catch {
        return "";
    }
}

/**
 * Exchanges the callback code for a user API key. The verifier is removed in
 * every outcome because OpenRouter codes are single-use.
 */
export async function completeAuth({
    search = globalThis.location?.search || "",
    sessionStorage = globalThis.sessionStorage,
    fetchImpl = globalThis.fetch,
    now = new Date()
} = {}) {
    const params = new URLSearchParams(search);
    const code = params.get("code");
    if (!code) throw new Error("OpenRouter no devolvió un código de autorización.");

    const pending = loadPending(sessionStorage);
    if (!pending) {
        const message = "No hay una autorización pendiente. Iniciá la conexión desde el asistente.";
        setAuthError(message, sessionStorage);
        throw new Error(message);
    }

    const returnedState = params.get("state") || "";
    if (pending.state && returnedState !== pending.state) {
        clearPending(sessionStorage);
        const message = "El parámetro state no coincide. Se descartó la respuesta por seguridad.";
        setAuthError(message, sessionStorage);
        throw new Error(message);
    }

    try {
        const response = await fetchImpl(`${API_BASE}/auth/keys`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code,
                code_verifier: pending.verifier,
                code_challenge_method: "S256"
            })
        });

        if (!response.ok) {
            const detail = await errorDetail(response);
            throw new Error(`OpenRouter respondió ${response.status}. ${detail}`.trim());
        }

        const data = await response.json();
        const key = data?.key;
        if (typeof key !== "string" || !key) throw new Error("OpenRouter no devolvió una clave de API.");

        const connection = saveConnection({
            key,
            model: DEFAULT_MODEL,
            connected_at: now.toISOString()
        }, sessionStorage);
        sessionStorage?.removeItem(AUTH_ERROR_KEY);
        return connection;
    } catch (error) {
        setAuthError(error.message, sessionStorage);
        throw error;
    } finally {
        clearPending(sessionStorage);
    }
}

export async function fetchModels({
    apiKey,
    fetchImpl = globalThis.fetch,
    useCache = true
} = {}) {
    if (useCache && modelsCache) return modelsCache;
    if (!apiKey) throw new Error("Conectá OpenRouter para cargar los modelos.");

    const response = await fetchImpl(`${API_BASE}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (!response.ok) throw new Error(`No se pudieron cargar los modelos (${response.status}).`);

    const data = await response.json();
    const models = (Array.isArray(data?.data) ? data.data : [])
        .filter(model => model?.id)
        .map(model => ({
            id: model.id,
            name: model.name || model.id,
            context: model.context_length || null,
            free: model.pricing?.prompt === "0" && model.pricing?.completion === "0"
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    modelsCache = models;
    return models;
}

export function cachedModels() {
    return modelsCache;
}

export function clearModelsCache() {
    modelsCache = null;
}

export async function testConnection({
    apiKey,
    fetchImpl = globalThis.fetch
} = {}) {
    if (!apiKey) throw new Error("Conectá OpenRouter antes de probar.");
    const response = await fetchImpl(`${API_BASE}/key`, {
        headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (!response.ok) {
        const detail = await errorDetail(response);
        throw new Error(`La clave no fue aceptada (${response.status}). ${detail}`.trim());
    }
    const data = await response.json();
    const info = data?.data || {};
    return {
        label: info.label || "OpenRouter",
        usage: Number(info.usage || 0),
        limit: info.limit ?? null,
        freeTier: Boolean(info.is_free_tier),
        rateLimit: info.rate_limit || null
    };
}

function messageText(content) {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content.map(part => part?.text || "").filter(Boolean).join("\n");
    }
    return "";
}

/** Calls OpenRouter only when the caller passes allowNetwork: true. */
export async function askOpenRouter({
    apiKey,
    model = DEFAULT_MODEL,
    prompt,
    allowNetwork = false,
    fetchImpl = globalThis.fetch,
    timeoutMs = 120000
} = {}) {
    if (!allowNetwork) throw new Error("El envío a OpenRouter requiere consentimiento explícito para esta consulta.");
    if (!apiKey) throw new Error("No hay una conexión de OpenRouter activa.");
    if (!String(prompt ?? "").trim()) throw new Error("El prompt está vacío.");
    if (typeof fetchImpl !== "function") throw new Error("No hay fetch disponible en este entorno.");

    const cleanModel = String(model || DEFAULT_MODEL).trim();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetchImpl(`${API_BASE}/chat/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: cleanModel,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2,
                provider: { data_collection: "deny" }
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            const detail = await errorDetail(response);
            throw new Error(`OpenRouter respondió ${response.status}. ${detail}`.trim());
        }

        const data = await response.json();
        const text = messageText(data?.choices?.[0]?.message?.content).trim();
        if (!text) throw new Error("El modelo no devolvió texto.");

        return {
            text,
            model: data?.model || cleanModel,
            usage: data?.usage || null
        };
    } catch (error) {
        if (error?.name === "AbortError") {
            throw new Error("OpenRouter no respondió a tiempo. Probá con otro modelo o revisá tu conexión.");
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
}
