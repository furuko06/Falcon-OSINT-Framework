import { describe, it, expect, beforeEach, vi } from "vitest";

const store = new Map();
globalThis.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
};

let assistant;

const DATA = {
    tools: [
        { name: "InVID Verification Plugin", category: "Verification", subcategory: "Video Verification", description: "Extrae fotogramas y revisa videos.", website: "https://example.test/invid" },
        { name: "Shodan", category: "Infrastructure", description: "Buscador de servicios expuestos.", website: "https://example.test/shodan" }
    ],
    lessons: [
        { id: "verification", title: "Verificación de imágenes y afirmaciones", summary: "Cuándo una imagen resiste la triangulación.", keyPoints: ["Buscá la primera copia y la fuente primaria."], sources: [{ title: "Full Fact", url: "https://example.test/fullfact" }] }
    ],
    labs: [
        { id: "viral-claim", title: "Laboratorio: verificar una afirmación viral", scenario: "Un video circula sin contexto.", steps: ["Extraer fotogramas.", "Buscar la primera publicación."] }
    ],
    playbooks: [
        { id: "video-geolocate", title: "Geolocalizar un video", objective: "Ubicar el lugar y la fecha de un video.", steps: ["Extraer fotogramas clave.", "Contrastar sombras con la fecha."], tools: [{ name: "InVID" }, { name: "SunCalc" }] },
        { id: "domain", title: "Domain Enumeration", objective: "Enumerar la superficie pública de un dominio.", steps: ["Consultar WHOIS."], tools: [{ name: "Shodan" }] }
    ]
};

async function loadModules() {
    vi.resetModules();
    store.clear();
    assistant = await import("../framework/modules/assistant/assistant.js");
}

describe("assistant retrieval (E12)", () => {
    beforeEach(loadModules);

    it("builds citable documents from every local dataset", () => {
        const documents = assistant.buildDocuments(DATA);
        expect(documents).toHaveLength(6);
        expect(documents.map(d => d.kind)).toEqual(expect.arrayContaining(["Herramienta", "Academy", "Laboratorio", "Playbook"]));
        expect(documents.every(d => d.id && d.title && d.text)).toBe(true);
    });

    it("ranks the most relevant playbook and tool for a query", () => {
        const documents = assistant.buildDocuments(DATA);
        const results = assistant.retrieve(documents, "verificar fecha de un video");
        expect(results[0].id).toBe("playbook:video-geolocate");
        expect(results.map(d => d.id)).toContain("tool:InVID Verification Plugin");
        expect(assistant.retrieve(documents, "servicios expuestos")[0].id).toBe("tool:Shodan");
    });

    it("returns nothing for empty or stopword-only queries", () => {
        const documents = assistant.buildDocuments(DATA);
        expect(assistant.retrieve(documents, "")).toEqual([]);
        expect(assistant.retrieve(documents, "de la el")).toEqual([]);
    });

    it("numbers sources and truncates long context", () => {
        const long = "palabra ".repeat(400);
        const { context, sources } = assistant.buildContext([
            { id: "a", kind: "Herramienta", title: "A", text: long, url: "https://example.test" },
            { id: "b", kind: "Academy", title: "B", text: "Texto corto" }
        ]);
        expect(sources.map(s => s.n)).toEqual([1, 2]);
        expect(sources[0]).toMatchObject({ title: "A", url: "https://example.test" });
        expect(context).toContain("[1] (Herramienta) A");
        expect(context.length).toBeLessThan(long.length);
    });

    it("builds a grounded prompt and includes notes only when provided", () => {
        const base = { question: "¿Cómo verifico el video?", context: "[1] (Playbook) Geolocalizar un video" };
        const prompt = assistant.buildPrompt(base);
        expect(prompt).toContain("Citá cada afirmación");
        expect(prompt).toContain("[1] (Playbook) Geolocalizar un video");
        expect(prompt).not.toContain("Notas del analista");

        const withNotes = assistant.buildPrompt({ ...base, notes: "Dato sin confirmar" });
        expect(withNotes).toContain("Notas del analista");
        expect(withNotes).toContain("Dato sin confirmar");
        expect(() => assistant.buildPrompt({ question: "  ", context: "" })).toThrow();
    });

    it("produces a deterministic offline briefing without any model", () => {
        const documents = assistant.buildDocuments(DATA);
        const found = assistant.retrieve(documents, "video fecha");
        const answer = assistant.offlineAnswer("¿Cómo verifico el video?", found);
        expect(answer).toContain("sin modelo externo");
        expect(answer).toContain("Geolocalizar un video");
        expect(assistant.offlineAnswer("x", [])).toContain("No encontré coincidencias");
    });
});

describe("assistant local-only model policy (E12)", () => {
    beforeEach(loadModules);

    it("accepts loopback endpoints and rejects everything else", () => {
        expect(assistant.assertLocalEndpoint("http://localhost:11434")).toBe("http://localhost:11434");
        expect(assistant.assertLocalEndpoint("http://127.0.0.1:11434/")).toBe("http://127.0.0.1:11434");
        expect(assistant.assertLocalEndpoint("http://[::1]:11434")).toBe("http://[::1]:11434");
        expect(() => assistant.assertLocalEndpoint("https://api.openai.com")).toThrow();
        expect(() => assistant.assertLocalEndpoint("http://ollama.example.com:11434")).toThrow();
        expect(() => assistant.assertLocalEndpoint("http://user:pass@localhost:11434")).toThrow();
        expect(() => assistant.assertLocalEndpoint("not a url")).toThrow();
    });

    it("never calls fetch without explicit consent", async () => {
        const fetchImpl = vi.fn();
        await expect(assistant.askOllama({ prompt: "hola", fetchImpl })).rejects.toThrow(/consentimiento/);
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("posts to the local generate endpoint and returns the text", async () => {
        const fetchImpl = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ model: "llama3.2", response: "  Respuesta local [1].  " })
        });
        const result = await assistant.askOllama({
            prompt: "pregunta",
            allowNetwork: true,
            fetchImpl,
            endpoint: "http://127.0.0.1:11434"
        });
        expect(result).toEqual({ text: "Respuesta local [1].", model: "llama3.2" });
        expect(fetchImpl).toHaveBeenCalledTimes(1);
        const [url, options] = fetchImpl.mock.calls[0];
        expect(url).toBe("http://127.0.0.1:11434/api/generate");
        const body = JSON.parse(options.body);
        expect(body).toMatchObject({ model: "llama3.2", prompt: "pregunta", stream: false });
    });

    it("refuses a remote endpoint even with consent and surfaces server errors", async () => {
        const fetchImpl = vi.fn();
        await expect(assistant.askOllama({ prompt: "x", allowNetwork: true, fetchImpl, endpoint: "https://api.example.com" }))
            .rejects.toThrow(/servidor local/);
        expect(fetchImpl).not.toHaveBeenCalled();

        await expect(assistant.askOllama({
            prompt: "x",
            allowNetwork: true,
            fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "boom" })
        })).rejects.toThrow(/500/);
    });

    it("persists only endpoint, model and the notes preference", () => {
        const settings = assistant.loadAssistantSettings();
        expect(settings).toMatchObject({ endpoint: assistant.DEFAULT_ENDPOINT, model: assistant.DEFAULT_MODEL });
        assistant.saveAssistantSettings({ endpoint: "http://localhost:11434", model: "mistral", includeNotes: true, notes: "secreto" });
        const stored = JSON.parse(store.get("falcon:assistant"));
        expect(stored).toEqual({ endpoint: "http://localhost:11434", model: "mistral", includeNotes: true });
    });
});

describe("assistant note triage (E12)", () => {
    beforeEach(loadModules);

    it("flags missing provenance, date and confidence", () => {
        const triage = assistant.auditNotes("Vi un video de un edificio en llamas y creo que es de hoy.");
        expect(triage.checks.find(c => c.id === "source").passed).toBe(false);
        expect(triage.checks.find(c => c.id === "date").passed).toBe(false);
        expect(triage.suggestions.length).toBeGreaterThan(0);
    });

    it("accepts notes with source, date and confidence", () => {
        const triage = assistant.auditNotes("Fuente: https://example.test/nota. Fecha: 12/11/2026. El incendio está confirmado por dos medios locales; el origen del video sigue sin confirmar. Guardé una copia archivada del original para otra revisión.");
        expect(triage.suggestions).toEqual([]);
        expect(triage.checks.every(c => c.passed)).toBe(true);
    });

    it("returns an extractive summary limited to the requested sentences", () => {
        const summary = assistant.extractiveSummary("Primera oración. Segunda oración. Tercera. Cuarta.", 2);
        expect(summary).toBe("Primera oración. Segunda oración.");
        expect(assistant.auditNotes("").summary).toBe("");
    });
});
