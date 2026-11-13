import { describe, it, expect, beforeEach, vi } from "vitest";

const store = new Map();
globalThis.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
};

const { getHealthAlerts } = await import("../framework/modules/dashboard/health.js");
const collections = await import("../framework/modules/collections/collections.js");

const NOW = Date.parse("2026-11-12T00:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

describe("getHealthAlerts", () => {
    it("counts recent verification, broken and deprecated tools", () => {
        const tools = [
            { status: "verified", last_verified: new Date(NOW - 2 * DAY).toISOString() },
            { status: "verified", last_verified: new Date(NOW - 90 * DAY).toISOString() },
            { status: "broken", last_verified: null },
            { status: "deprecated", last_verified: "not-a-date" }
        ];
        const h = getHealthAlerts(tools, NOW);
        expect(h.recentlyVerified).toBe(1);
        expect(h.broken).toBe(1);
        expect(h.deprecated).toBe(1);
        expect(h.count).toBe(2);
        expect(h.communityHealth).toBe("50%");
        expect(h.communityDetail).toBe("2 of 4 verified");
    });

    it("returns zeros for an empty list", () => {
        const h = getHealthAlerts([], NOW);
        expect(h.communityHealth).toBe("0%");
        expect(h.count).toBe(0);
    });

    it("ignores dates in the future", () => {
        const h = getHealthAlerts([{ status: "verified", last_verified: new Date(NOW + DAY).toISOString() }], NOW);
        expect(h.recentlyVerified).toBe(0);
    });
});

describe("collections", () => {
    beforeEach(() => {
        store.clear();
        for (const c of [...collections.getCollections()]) collections.deleteCollection(c.id);
    });

    it("creates a collection with normalized tags and persists it", () => {
        const col = collections.createCollection({ name: "  Caso A  ", tags: " OSINT, osint , Email " });
        expect(col.name).toBe("Caso A");
        expect(col.tags).toEqual(["osint", "email"]);
        expect(JSON.parse(store.get("falcon:collections"))[0].id).toBe(col.id);
    });

    it("rejects an empty name", () => {
        expect(() => collections.createCollection({ name: "   " })).toThrow();
    });

    it("toggles a tool in and out of a collection", () => {
        const col = collections.createCollection({ name: "X" });
        collections.toggleToolInCollection(col.id, 7);
        expect(collections.collectionsContaining(7).map(c => c.id)).toEqual([col.id]);
        collections.toggleToolInCollection(col.id, 7);
        expect(collections.collectionsContaining(7)).toEqual([]);
    });

    it("notifies subscribers on change", () => {
        const fn = vi.fn();
        const unsub = collections.subscribeCollections(fn);
        collections.createCollection({ name: "Y" });
        expect(fn).toHaveBeenCalled();
        unsub();
    });

    it("exports JSON with the resolved tools and Markdown with links and notes", () => {
        const col = collections.createCollection({ name: "Export", tags: ["t"] });
        collections.toggleToolInCollection(col.id, 1);
        collections.setCollectionNotes(col.id, "nota final");
        const tools = [{ id: 1, name: "Sherlock", category: "Username", website: "https://example.com" }];
        const current = collections.getCollections().find(c => c.id === col.id);

        const json = JSON.parse(collections.exportCollectionJSON(current, tools));
        expect(json.tools[0].name).toBe("Sherlock");

        const md = collections.exportCollectionMarkdown(current, tools);
        expect(md).toContain("# Export");
        expect(md).toContain("**Sherlock** (Username) — https://example.com");
        expect(md).toContain("## Notas");
        expect(md).toContain("nota final");
    });
});
