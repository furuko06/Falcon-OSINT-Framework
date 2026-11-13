import { describe, it, expect, beforeEach, vi } from "vitest";

const store = new Map();
globalThis.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
};

let playbooks;
let graph;

// Each test reloads the modules so the in-memory copy starts from empty storage.
async function loadModules() {
    vi.resetModules();
    store.clear();
    playbooks = await import("../framework/modules/playbooks/playbooks.js");
    graph = await import("../framework/modules/graph/graph.js");
}

describe("playbooks (E8)", () => {
    beforeEach(loadModules);

    it("ships the investigation playbooks, each with a valid tactic", () => {
        const tactics = playbooks.TACTICS.map(t => t.id);
        expect(playbooks.PLAYBOOKS.map(p => p.id)).toEqual([
            "username", "email", "domain", "telegram", "company",
            "image-person", "image-place", "image-freshness", "news-old-image",
            "disinfo-claim", "crypto-tracing", "money-corporate", "scam-rug-pull"
        ]);
        for (const p of playbooks.PLAYBOOKS) {
            expect(tactics).toContain(p.tactic);
            expect(p.steps.length).toBeGreaterThan(0);
            expect(p.checklist.length).toBeGreaterThan(0);
        }
    });

    it("stores state and favorite per playbook", () => {
        playbooks.setPlaybookState("email", "in_progress");
        playbooks.togglePlaybookFavorite("email");
        expect(playbooks.getProgress("email")).toMatchObject({ state: "in_progress", favorite: true });
        playbooks.setPlaybookState("email", null);
        expect(playbooks.getProgress("email").state).toBeNull();
    });

    it("toggles checklist items", () => {
        const item = playbooks.getPlaybook("domain").checklist[0];
        playbooks.toggleChecklistItem("domain", item);
        expect(playbooks.getProgress("domain").checked).toEqual([item]);
        playbooks.toggleChecklistItem("domain", item);
        expect(playbooks.getProgress("domain").checked).toEqual([]);
    });

    it("rejects unknown playbooks, states and checklist items", () => {
        expect(() => playbooks.setPlaybookState("nope", "completed")).toThrow();
        expect(() => playbooks.setPlaybookState("email", "bogus")).toThrow();
        expect(() => playbooks.toggleChecklistItem("email", "no such item")).toThrow();
    });
});

describe("knowledge graph (E9)", () => {
    beforeEach(loadModules);

    it("adds entities and de-duplicates by type and value", () => {
        const a = graph.addEntity({ type: "Dominio", value: "example.com" });
        const b = graph.addEntity({ type: "Dominio", value: "EXAMPLE.com " });
        expect(b.id).toBe(a.id);
        expect(graph.getGraph().entities).toHaveLength(1);
    });

    it("rejects invalid types and empty values", () => {
        expect(() => graph.addEntity({ type: "Desconocido", value: "x" })).toThrow();
        expect(() => graph.addEntity({ type: "Email", value: "   " })).toThrow();
    });

    it("links entities with explicit confidence and lists neighbors", () => {
        const persona = graph.addEntity({ type: "Persona", value: "Ana" });
        const empresa = graph.addEntity({ type: "Empresa", value: "ACME" });
        graph.addRelation({ from: persona.id, to: empresa.id, label: "trabaja en", confidence: "baja" });
        const neighbors = graph.neighborsOf(empresa.id);
        expect(neighbors).toHaveLength(1);
        expect(neighbors[0].entity.id).toBe(persona.id);
        expect(neighbors[0].relation.confidence).toBe("baja");
    });

    it("rejects self-links, unknown endpoints and invalid confidence", () => {
        const e = graph.addEntity({ type: "Email", value: "a@b.c" });
        const f = graph.addEntity({ type: "Usuario", value: "abc" });
        expect(() => graph.addRelation({ from: e.id, to: e.id, label: "x" })).toThrow();
        expect(() => graph.addRelation({ from: e.id, to: "missing", label: "x" })).toThrow();
        expect(() => graph.addRelation({ from: e.id, to: f.id, label: "x", confidence: "total" })).toThrow();
    });

    it("removing an entity also removes its relations", () => {
        const a = graph.addEntity({ type: "Dominio", value: "a.com" });
        const b = graph.addEntity({ type: "IOC", value: "1.2.3.4" });
        graph.addRelation({ from: a.id, to: b.id, label: "aloja" });
        graph.removeEntity(a.id);
        expect(graph.getGraph().relations).toHaveLength(0);
    });
});
