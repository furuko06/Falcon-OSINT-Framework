import { describe, it, expect, vi } from "vitest";
import {
    DEFAULT_MODEL,
    PENDING_KEY,
    SESSION_KEY,
    askOpenRouter,
    beginAuth,
    cachedModels,
    clearModelsCache,
    codeChallenge,
    completeAuth,
    disconnect,
    fetchModels,
    loadConnection,
    loadPending,
    maskKey,
    testConnection
} from "../framework/modules/assistant/openrouter.js";

class MemoryStorage {
    constructor() { this.map = new Map(); }
    getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
    setItem(key, value) { this.map.set(key, String(value)); }
    removeItem(key) { this.map.delete(key); }
}

function response(body, { ok = true, status = 200 } = {}) {
    return { ok, status, json: async () => body, text: async () => JSON.stringify(body) };
}

describe("OpenRouter OAuth PKCE", () => {
    it("matches the RFC 7636 S256 challenge vector", async () => {
        expect(await codeChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"))
            .toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
    });

    it("builds the authorization URL and stores only the verifier in session storage", async () => {
        const sessionStorage = new MemoryStorage();
        const redirect = vi.fn();
        const result = await beginAuth({
            locationLike: { origin: "https://falcon.example", pathname: "/app/" },
            sessionStorage,
            redirect,
            now: new Date("2026-11-13T12:00:00.000Z")
        });

        const url = new URL(result.url);
        expect(url.origin + url.pathname).toBe("https://openrouter.ai/auth");
        expect(url.searchParams.get("callback_url")).toBe("https://falcon.example/app/");
        expect(url.searchParams.get("code_challenge_method")).toBe("S256");
        expect(url.searchParams.get("state")).toBe(result.state);
        expect(redirect).toHaveBeenCalledWith(result.url);
        expect(loadPending(sessionStorage)).toMatchObject({
            state: result.state,
            callback_url: "https://falcon.example/app/"
        });
        expect(sessionStorage.getItem(PENDING_KEY)).not.toContain("code=");
    });

    it("exchanges the code and keeps the key in session storage", async () => {
        const sessionStorage = new MemoryStorage();
        const redirect = vi.fn();
        const auth = await beginAuth({
            locationLike: { origin: "https://falcon.example", pathname: "/" },
            sessionStorage,
            redirect
        });
        const fetchImpl = vi.fn().mockResolvedValue(response({ key: "sk-or-v1-test" }));

        const connection = await completeAuth({
            search: `?code=code-123&state=${encodeURIComponent(auth.state)}`,
            sessionStorage,
            fetchImpl,
            now: new Date("2026-11-13T12:00:00.000Z")
        });

        expect(connection).toMatchObject({ provider: "openrouter", key: "sk-or-v1-test", model: DEFAULT_MODEL });
        expect(fetchImpl).toHaveBeenCalledWith(
            "https://openrouter.ai/api/v1/auth/keys",
            expect.objectContaining({ method: "POST" })
        );
        const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
        expect(body).toMatchObject({ code: "code-123", code_challenge_method: "S256" });
        expect(body.code_verifier).toBeTruthy();
        expect(loadPending(sessionStorage)).toBeNull();
        expect(loadConnection(sessionStorage).key).toBe("sk-or-v1-test");
        expect(maskKey("sk-or-v1-test")).toBe("sk-or-…test");
    });

    it("rejects a state mismatch and clears the pending verifier", async () => {
        const sessionStorage = new MemoryStorage();
        await beginAuth({
            locationLike: { origin: "https://falcon.example", pathname: "/" },
            sessionStorage,
            redirect: vi.fn()
        });

        await expect(completeAuth({
            search: "?code=evil&state=wrong",
            sessionStorage,
            fetchImpl: vi.fn()
        })).rejects.toThrow(/state/);
        expect(loadPending(sessionStorage)).toBeNull();
    });

    it("surfaces exchange errors without storing a connection", async () => {
        const sessionStorage = new MemoryStorage();
        const auth = await beginAuth({
            locationLike: { origin: "https://falcon.example", pathname: "/" },
            sessionStorage,
            redirect: vi.fn()
        });

        await expect(completeAuth({
            search: `?code=expired&state=${encodeURIComponent(auth.state)}`,
            sessionStorage,
            fetchImpl: vi.fn().mockResolvedValue(response({ error: { message: "expired" } }, { ok: false, status: 403 }))
        })).rejects.toThrow(/403/);
        expect(loadConnection(sessionStorage)).toBeNull();
    });
});

describe("OpenRouter client", () => {
    it("refuses to call without explicit consent", async () => {
        const fetchImpl = vi.fn();
        await expect(askOpenRouter({ apiKey: "k", prompt: "hola", fetchImpl }))
            .rejects.toThrow(/consentimiento/);
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("sends the prompt and parses the answer", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(response({
            model: "openai/gpt-test",
            choices: [{ message: { content: "  Respuesta [1].  " } }],
            usage: { total_tokens: 42 }
        }));

        const result = await askOpenRouter({
            apiKey: "sk-or-test",
            model: "openai/gpt-test",
            prompt: "pregunta",
            allowNetwork: true,
            fetchImpl
        });

        expect(result).toMatchObject({ text: "Respuesta [1].", model: "openai/gpt-test" });
        const [url, options] = fetchImpl.mock.calls[0];
        expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
        expect(options.headers.Authorization).toBe("Bearer sk-or-test");
        expect(JSON.parse(options.body)).toMatchObject({
            model: "openai/gpt-test",
            provider: { data_collection: "deny" },
            messages: [{ role: "user", content: "pregunta" }]
        });
    });

    it("loads models, caches them and reports free ones", async () => {
        clearModelsCache();
        const fetchImpl = vi.fn().mockResolvedValue(response({
            data: [
                { id: "z/model", name: "Zed", pricing: { prompt: "0", completion: "0" } },
                { id: "a/model", name: "Alpha", context_length: 128000, pricing: { prompt: "1", completion: "2" } }
            ]
        }));

        const models = await fetchModels({ apiKey: "k", fetchImpl });
        expect(models.map(model => model.id)).toEqual(["a/model", "z/model"]);
        expect(models[1].free).toBe(true);
        await fetchModels({ apiKey: "k", fetchImpl });
        expect(fetchImpl).toHaveBeenCalledTimes(1);
        expect(cachedModels()).toHaveLength(2);
        clearModelsCache();
    });

    it("tests a connection through the key endpoint", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(response({
            data: { label: "Falcon", usage: 0.12, limit: 10, is_free_tier: true }
        }));
        const info = await testConnection({ apiKey: "sk-or-test", fetchImpl });
        expect(info).toMatchObject({ label: "Falcon", usage: 0.12, limit: 10, freeTier: true });
        expect(fetchImpl.mock.calls[0][0]).toBe("https://openrouter.ai/api/v1/key");
    });

    it("clears the session connection", () => {
        const sessionStorage = new MemoryStorage();
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ key: "x", model: "m" }));
        disconnect(sessionStorage);
        expect(loadConnection(sessionStorage)).toBeNull();
    });
});
