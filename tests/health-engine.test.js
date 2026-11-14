import { describe, it, expect, beforeEach } from "vitest";

const store = new Map();
globalThis.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
};

const engine = await import("../framework/modules/health/engine.js");

describe("health engine", () => {
    beforeEach(() => store.clear());

    it("scores by status and clamps to 0-100", () => {
        expect(engine.healthScore({ status: "verified" })).toBe(100);
        expect(engine.healthScore({ status: "broken" })).toBe(0);
        const score = engine.healthScore({ status: "verified" }, { reports: { broken: 99, update: 99 } });
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    it("penalizes community reports", () => {
        const base = engine.healthScore({ status: "working" });
        const reported = engine.healthScore({ status: "working" }, { reports: { broken: 2, update: 0 } });
        expect(reported).toBeLessThan(base);
    });

    it("rewards a recent verification", () => {
        const now = 1_000_000_000_000;
        const base = engine.healthScore({ status: "beta" }, { now });
        const verified = engine.healthScore({ status: "beta" }, { history: [{ at: now - 1000, status: "working" }], now });
        expect(verified).toBeGreaterThan(base);
    });

    it("stores reports and rejects unknown types", () => {
        engine.reportTool("t1", "broken");
        engine.reportTool("t1", "broken");
        expect(engine.getReports("t1").broken).toBe(2);
        expect(() => engine.reportTool("t1", "spam")).toThrow();
    });

    it("flags broken tools from status or from repeated reports", () => {
        expect(engine.detectBroken({ status: "broken" })).toBe(true);
        expect(engine.detectBroken({ status: "working" }, { reports: { broken: 2, update: 0 } })).toBe(true);
        expect(engine.detectBroken({ status: "working" }, { reports: { broken: 1, update: 0 } })).toBe(false);
    });

    it("a fresh working verification clears community broken flags", () => {
        const now = 1_000_000_000_000;
        const history = [{ at: now - 1000, status: "working" }];
        expect(engine.detectBroken({ status: "working" }, { reports: { broken: 3, update: 0 }, history, now })).toBe(false);
    });

    it("records verification history and keeps the latest entries", () => {
        engine.recordVerification("t2", "working", 1);
        const list = engine.recordVerification("t2", "nonsense", 2);
        expect(list).toHaveLength(2);
        expect(list[1].status).toBe("beta");
    });

    it("evaluateAll sorts the worst tools first", () => {
        const rows = engine.evaluateAll([{ id: "a", name: "A", status: "verified" }, { id: "b", name: "B", status: "broken" }]);
        expect(rows[0].id).toBe("b");
        expect(rows[0].broken).toBe(true);
    });
});
