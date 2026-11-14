import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { loadJson, runChecks, schemaFiles, schemaHash, validate } from "../scripts/contracts-check.mjs";
import { FRAMEWORK_VERSION, validateManifest } from "../framework/modules/plugins/sdk.js";

const version = loadJson("contracts/contract-version.json");
const packageJson = loadJson("package.json");
const toolSchema = loadJson("contracts/tool.schema.json");
const pluginSchema = loadJson("contracts/plugin-manifest.schema.json");

describe("frozen contracts (G6)", () => {
    it("validates the shipped data against every schema", async () => {
        const { problems, counts } = await runChecks();
        expect(problems).toEqual([]);
        expect(counts.tools).toBeGreaterThan(170);
        expect(counts.playbooks).toBeGreaterThan(40);
    });

    it("locks each schema so a silent shape change fails", () => {
        const lock = loadJson("contracts/contract-lock.json");
        for (const file of schemaFiles()) {
            expect(lock.schemas[file]).toBe(schemaHash(file));
        }
        expect(Object.keys(lock.schemas).sort()).toEqual(version.schemas.slice().sort());
    });

    it("keeps the contract version aligned with the release", () => {
        expect(version.frozen).toBe(true);
        expect(version.version).toBe(packageJson.version);
        expect(version.frozenUntil).toBe("2.0.0");
    });

    it("rejects a tool record outside the contract", () => {
        const base = { name: "Ejemplo", category: "HUMINT", status: "verified", last_verified: "2026-11-13" };
        expect(validate(base, toolSchema)).toEqual([]);
        expect(validate({ ...base, name: "" }, toolSchema).length).toBeGreaterThan(0);
        expect(validate({ ...base, status: "ok" }, toolSchema).length).toBeGreaterThan(0);
        expect(validate({ ...base, unexpected: true }, toolSchema).length).toBeGreaterThan(0);
        expect(validate({ ...base, website: "ftp://example.com" }, toolSchema).length).toBeGreaterThan(0);
        expect(validate({ category: "HUMINT", status: "verified" }, toolSchema).length).toBeGreaterThan(0);
    });

    it("rejects a plugin manifest outside the frozen permission list", () => {
        const manifest = { id: "demo-plugin", name: "Demo", version: "1.0.0", author: "Falcon", license: "MIT", minFramework: "1.0.0", permissions: ["network"] };
        expect(validate(manifest, pluginSchema)).toEqual([]);
        expect(validate({ ...manifest, permissions: ["root"] }, pluginSchema).length).toBeGreaterThan(0);
        expect(validate({ ...manifest, id: "Demo Plugin" }, pluginSchema).length).toBeGreaterThan(0);
        expect(validateManifest(manifest).ok).toBe(true);
    });

    it("reports the running framework version to plugins", () => {
        expect(FRAMEWORK_VERSION).toBe(packageJson.version);
        expect(fs.existsSync("contracts/contract-lock.json")).toBe(true);
    });
});
