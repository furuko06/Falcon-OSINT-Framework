import { describe, it, expect, beforeEach } from "vitest";

const store = new Map();
globalThis.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
};

const sdk = await import("../framework/modules/plugins/sdk.js");
const { listMarketplace } = await import("../framework/modules/plugins/marketplace.js");

const base = {
    id: "shodan-lite",
    name: "Shodan Lite",
    version: "1.0.0",
    author: "Falcon",
    license: "MIT",
    minFramework: "0.1.0",
    permissions: ["network"]
};

describe("validateManifest", () => {
    it("accepts a valid manifest", () => {
        expect(sdk.validateManifest(base).ok).toBe(true);
    });

    it("reports every missing or invalid field", () => {
        const res = sdk.validateManifest({ ...base, id: "Bad Id", version: "1.0", permissions: ["teleport"] });
        expect(res.ok).toBe(false);
        expect(res.errors.join(" ")).toMatch(/id debe ser/);
        expect(res.errors.join(" ")).toMatch(/version debe tener formato/);
        expect(res.errors.join(" ")).toMatch(/permisos desconocidos: teleport/);
    });

    it("rejects plugins that need a newer framework", () => {
        const res = sdk.validateManifest({ ...base, minFramework: "9.0.0" });
        expect(res.errors.join(" ")).toMatch(/requiere Falcon 9.0.0/);
    });
});

describe("install / update / remove", () => {
    beforeEach(() => {
        store.clear();
        for (const p of sdk.listInstalledPlugins()) sdk.removePlugin(p.id);
    });

    it("installs when the accepted permissions match the manifest", () => {
        sdk.installPlugin(base, ["network"]);
        expect(sdk.getInstalledPlugin("shodan-lite")).not.toBeNull();
    });

    it("refuses installation when permissions are not exactly accepted", () => {
        expect(() => sdk.installPlugin(base, [])).toThrow(/permisos declarados/);
        expect(() => sdk.installPlugin(base, ["network", "shell"])).toThrow(/permisos declarados/);
        expect(sdk.listInstalledPlugins()).toEqual([]);
    });

    it("refuses a duplicate install", () => {
        sdk.installPlugin(base, ["network"]);
        expect(() => sdk.installPlugin(base, ["network"])).toThrow(/ya está instalado/);
    });

    it("updates only to a higher version", () => {
        sdk.installPlugin(base, ["network"]);
        expect(() => sdk.updatePlugin(base, ["network"])).toThrow(/mayor/);
        sdk.updatePlugin({ ...base, version: "1.1.0" }, ["network"]);
        expect(sdk.getInstalledPlugin("shodan-lite").version).toBe("1.1.0");
        expect(sdk.listInstalledPlugins()).toHaveLength(1);
    });

    it("removes a plugin", () => {
        sdk.installPlugin(base, ["network"]);
        sdk.removePlugin("shodan-lite");
        expect(sdk.getInstalledPlugin("shodan-lite")).toBeNull();
    });
});

describe("listMarketplace", () => {
    beforeEach(() => {
        store.clear();
        for (const p of sdk.listInstalledPlugins()) sdk.removePlugin(p.id);
    });

    it("skips invalid entries and flags installed ones", () => {
        sdk.installPlugin(base, ["network"]);
        const catalog = [
            base,
            { ...base, id: "other-tool", version: "2.0.0" },
            { id: "broken" }
        ];
        const { entries, rejected } = listMarketplace(catalog);
        expect(entries.map(e => e.id)).toEqual(["shodan-lite", "other-tool"]);
        expect(entries[0].installed).toBe(true);
        expect(entries[1].installed).toBe(false);
        expect(rejected.map(r => r.id)).toEqual(["broken"]);
    });
});
