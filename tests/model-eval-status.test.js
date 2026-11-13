import { describe, it, expect } from "vitest";
import { classifyRealRun, isProviderUnavailable } from "../scripts/lib/eval-status.mjs";

describe("model evaluation status", () => {
    it("marks a broken local server as BLOCKED instead of FAIL", () => {
        const result = classifyRealRun({
            cases: [
                { error: 'El servidor local respondió 500. {"error":"manifest path resolves outside manifest directory"}' },
                { error: "El servidor local respondió 500. manifest path resolves outside manifest directory" }
            ],
            datasetSize: 2,
            failures: ["11 errores de proveedor"],
            maxRealMs: 240000
        });
        expect(result.status).toBe("BLOCKED");
        expect(result.reason).toMatch(/proveedor no utilizable/);
        expect(result.reason).toMatch(/500/);
    });

    it("marks a rejected OpenRouter key as BLOCKED", () => {
        const result = classifyRealRun({
            cases: [{ error: "La clave no fue aceptada (401). No auth credentials found" }],
            datasetSize: 1,
            failures: ["citation_rate null"]
        });
        expect(result.status).toBe("BLOCKED");
    });

    it("keeps answer-quality failures as FAIL when at least one call succeeded", () => {
        const result = classifyRealRun({
            cases: [
                { error: "" },
                { error: "El servidor local respondió 500. boom" }
            ],
            datasetSize: 2,
            failures: ["citation_rate 0.4"]
        });
        expect(result.status).toBe("FAIL");
        expect(result.reason).toBe("");
    });

    it("keeps a clean run as PASS", () => {
        const result = classifyRealRun({ cases: [{ error: "" }], datasetSize: 1, failures: [] });
        expect(result).toEqual({ status: "PASS", reason: "" });
    });

    it("reports a time-budget cut as BLOCKED", () => {
        const result = classifyRealRun({ cases: [{ error: "" }], datasetSize: 11, failures: [], exhausted: true, maxRealMs: 240000 });
        expect(result.status).toBe("BLOCKED");
        expect(result.reason).toMatch(/presupuesto/);
    });

    it("does not treat a content error as a provider outage", () => {
        expect(isProviderUnavailable("El modelo no devolvió texto")).toBe(false);
    });
});
